import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';

export const asciiArtMeta = {
  charCount: 48,
  atlasCols: 8,
  atlasRows: 6,
  cellWidth: 32,
  cellHeight: 48,
  textureWidth: 256, // 8 * 32
  textureHeight: 290, // 6 * 48 + 2 data rows
  dataY: 288, // 6 * 48
} as const;

/**
 * An ASCII art image filter that converts an image into text characters.
 * Uses a 6-region shape vector approach (inspired by Alex Harri) to match
 * image cells to the best-fitting ASCII character based on spatial brightness patterns.
 *
 * Requires a pre-generated font atlas texture from `getAsciiArtFontAtlas()`.
 *
 * Fragment shader uniforms:
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_fontAtlas (sampler2D): Pre-generated font atlas with character bitmaps and shape data
 * - u_colorFront (vec4): Character foreground color in RGBA
 * - u_colorBack (vec4): Background color in RGBA
 * - u_originalColors (bool): Use sampled image's original colors instead of colorFront
 * - u_inverted (bool): Inverts the image luminance; not effective at zero contrast
 * - u_size (float): Grid size relative to the image box (0 to 1)
 * - u_contrast (float): Contrast applied to the sampled image (0 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): Image UV coordinates with global sizing (rotation, scale, offset, etc) applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 *
 */

// language=GLSL
export const asciiArtFragmentShader: string = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;
uniform sampler2D u_fontAtlas;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_size;
uniform float u_contrast;
uniform bool u_inverted;
uniform bool u_originalColors;

in vec2 v_imageUV;

out vec4 fragColor;

#define CHAR_COUNT ${ asciiArtMeta.charCount }
#define ATLAS_COLS ${ asciiArtMeta.atlasCols }
#define CELL_W ${ asciiArtMeta.cellWidth }.0
#define CELL_H ${ asciiArtMeta.cellHeight }.0
#define TEXTURE_W ${ asciiArtMeta.textureWidth }.0
#define TEXTURE_H ${ asciiArtMeta.textureHeight }.0
#define DATA_Y ${ asciiArtMeta.dataY }
#define CHAR_ASPECT (CELL_W / CELL_H)

float sigmoid(float x, float k) {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

float getUvFrame(vec2 uv, vec2 pad) {
  float aa = 0.0001;
  float left   = smoothstep(-pad.x, -pad.x + aa, uv.x);
  float right  = smoothstep(1.0 + pad.x, 1.0 + pad.x - aa, uv.x);
  float bottom = smoothstep(-pad.y, -pad.y + aa, uv.y);
  float top    = smoothstep(1.0 + pad.y, 1.0 + pad.y - aa, uv.y);
  return left * right * bottom * top;
}

void main() {
  // Check if the font atlas is loaded
  vec4 testTexel = texelFetch(u_fontAtlas, ivec2(0, DATA_Y), 0);
  if (testTexel.a < 0.5) {
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    fragColor = vec4(bgColor, u_colorBack.a);
    return;
  }

  // Grid setup: divide into character cells
  float cellsPerSide = mix(120., 10., pow(u_size, .7));
  float cellSizeY = 1.0 / cellsPerSide;
  vec2 cellSize = cellSizeY * vec2(CHAR_ASPECT / u_imageAspectRatio, 1.0);

  vec2 uv = v_imageUV - 0.5;
  vec2 p = uv / cellSize;
  vec2 cellIdx = floor(p);
  vec2 cellUV = fract(p);

  // Frame check: is this cell within image bounds?
  vec2 centerUV = (cellIdx + 0.5) * cellSize + 0.5;
  float frame = getUvFrame(centerUV, cellSize);

  if (frame < .01) {
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    fragColor = vec4(bgColor, u_colorBack.a);
    return;
  }

  // Contrast parameter
  float contrast = mix(0.0, 15.0, pow(u_contrast, 1.5));

  // Sample 6 sub-regions (3 rows x 2 cols) of the source image within this cell
  float samples[6];
  vec4 avgColor = vec4(0.0);

  for (int row = 0; row < 3; row++) {
    for (int col = 0; col < 2; col++) {
      vec2 offset = vec2(
        (float(col) + 0.5) / 2.0,
        (float(row) + 0.5) / 3.0
      );
      vec2 sampleUV = (cellIdx + offset) * cellSize + 0.5;
      vec4 tex = texture(u_image, sampleUV);

      vec3 c = vec3(
        sigmoid(tex.r, contrast),
        sigmoid(tex.g, contrast),
        sigmoid(tex.b, contrast)
      );
      float lum = dot(vec3(0.2126, 0.7152, 0.0722), c);
      lum = mix(1.0, lum, tex.a);
      if (u_inverted) lum = 1.0 - lum;

      samples[row * 2 + col] = lum;
      avgColor += tex;
    }
  }
  avgColor /= 6.0;

  // Find the best matching character via 6D shape vector distance
  int bestChar = 0;
  float bestDist = 1e6;

  for (int i = 0; i < CHAR_COUNT; i++) {
    vec4 data0 = texelFetch(u_fontAtlas, ivec2(i, DATA_Y), 0);
    vec4 data1 = texelFetch(u_fontAtlas, ivec2(i, DATA_Y + 1), 0);

    float dist = 0.0;
    float d;
    d = samples[0] - data0.r; dist += d * d;
    d = samples[1] - data0.g; dist += d * d;
    d = samples[2] - data0.b; dist += d * d;
    d = samples[3] - data1.r; dist += d * d;
    d = samples[4] - data1.g; dist += d * d;
    d = samples[5] - data1.b; dist += d * d;

    if (dist < bestDist) {
      bestDist = dist;
      bestChar = i;
    }
  }

  // Look up the character bitmap from the atlas
  int charCol = bestChar - (bestChar / ATLAS_COLS) * ATLAS_COLS;
  int charRow = bestChar / ATLAS_COLS;

  // Clamp cell UV by half a texel to prevent bleeding between adjacent atlas cells
  vec2 margin = 0.5 / vec2(CELL_W, CELL_H);
  vec2 clampedUV = clamp(cellUV, margin, 1.0 - margin);

  vec2 atlasUV = vec2(
    (float(charCol) + clampedUV.x) * CELL_W / TEXTURE_W,
    (float(charRow) + clampedUV.y) * CELL_H / TEXTURE_H
  );

  // Character mask: atlas has white background (1) with dark ink (0), so invert
  float charMask = 1.0 - texture(u_fontAtlas, atlasUV).r;
  charMask *= frame;

  // Color output
  vec3 color;
  float opacity;

  if (u_originalColors) {
    vec3 imgColor = avgColor.rgb * avgColor.a;
    float imgOpacity = avgColor.a;

    color = imgColor * charMask;
    opacity = imgOpacity * charMask;

    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    color = color + bgColor * (1.0 - opacity);
    opacity = opacity + u_colorBack.a * (1.0 - opacity);
  } else {
    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
    float fgOpacity = u_colorFront.a;
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;

    color = fgColor * charMask;
    opacity = fgOpacity * charMask;
    color += bgColor * (1.0 - opacity);
    opacity += bgOpacity * (1.0 - opacity);
  }

  fragColor = vec4(color, opacity);
}
`;

// Characters in the font atlas, selected for shape diversity across densities
const CHARS = " .'`^\",:;~-_=+!|/\\<>*()[]{}?oOC0LTIVAXYNQWM#%@&";

/**
 * Generates a font atlas texture with character bitmaps and pre-computed shape vector data.
 * Call this once, load the returned blob as an image, and pass it as the `fontAtlas` parameter.
 *
 * The atlas contains:
 * - Top area: character bitmaps arranged in an 8x6 grid
 * - Bottom 2 rows: encoded 6D shape vectors for each character (3 rows x 2 cols sub-region brightness)
 */
export function getAsciiArtFontAtlas(): Promise<{ blob: Blob }> {
  const { atlasCols, cellWidth, cellHeight, charCount, textureWidth, textureHeight, dataY } = asciiArtMeta;

  const canvas = document.createElement('canvas');
  canvas.width = textureWidth;
  canvas.height = textureHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to get canvas 2d context');
  }

  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, textureWidth, textureHeight);

  // Render characters to atlas grid
  const fontSize = Math.floor(cellHeight * 0.82);
  ctx.font = `${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'black';

  for (let i = 0; i < charCount; i++) {
    const col = i % atlasCols;
    const row = Math.floor(i / atlasCols);
    const x = col * cellWidth + cellWidth / 2;
    const y = row * cellHeight + cellHeight / 2;
    ctx.fillText(CHARS[i] ?? ' ', x, y);
  }

  // Compute 6D shape vectors from the rendered atlas
  const atlasImageData = ctx.getImageData(0, 0, textureWidth, dataY);
  const pixels = atlasImageData.data;
  const shapeVectors: number[][] = [];
  const subW = cellWidth / 2;
  const subH = cellHeight / 3;

  for (let i = 0; i < charCount; i++) {
    const col = i % atlasCols;
    const row = Math.floor(i / atlasCols);
    const cellX = col * cellWidth;
    const cellY = row * cellHeight;

    const vector: number[] = [];

    // Sample 6 sub-regions: 3 rows x 2 cols
    for (let sr = 0; sr < 3; sr++) {
      for (let sc = 0; sc < 2; sc++) {
        const subX = cellX + sc * subW;
        const subY = cellY + sr * subH;

        let sum = 0;
        let count = 0;
        for (let py = Math.floor(subY); py < Math.floor(subY + subH); py++) {
          for (let px = Math.floor(subX); px < Math.floor(subX + subW); px++) {
            const idx = (py * textureWidth + px) * 4;
            sum += (pixels[idx] ?? 0) / 255;
            count++;
          }
        }
        vector.push(count > 0 ? sum / count : 1.0);
      }
    }
    shapeVectors.push(vector);
  }

  // Encode shape vectors into the data strip (2 rows at the bottom)
  // Row 0 (y = dataY):     RGB = (v0, v1, v2), A = 255
  // Row 1 (y = dataY + 1): RGB = (v3, v4, v5), A = 255
  const dataImageData = ctx.createImageData(textureWidth, 2);
  const dataPx = dataImageData.data;

  for (let i = 0; i < charCount; i++) {
    const vec = shapeVectors[i]!;

    // Row 0
    const idx0 = i * 4;
    dataPx[idx0] = Math.round((vec[0] ?? 1) * 255);
    dataPx[idx0 + 1] = Math.round((vec[1] ?? 1) * 255);
    dataPx[idx0 + 2] = Math.round((vec[2] ?? 1) * 255);
    dataPx[idx0 + 3] = 255;

    // Row 1
    const idx1 = (textureWidth + i) * 4;
    dataPx[idx1] = Math.round((vec[3] ?? 1) * 255);
    dataPx[idx1 + 1] = Math.round((vec[4] ?? 1) * 255);
    dataPx[idx1 + 2] = Math.round((vec[5] ?? 1) * 255);
    dataPx[idx1 + 3] = 255;
  }

  ctx.putImageData(dataImageData, 0, dataY);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create font atlas blob'));
        return;
      }
      resolve({ blob });
    }, 'image/png');
  });
}

export interface AsciiArtUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_fontAtlas: HTMLImageElement | string | undefined;
  u_colorFront: [number, number, number, number];
  u_colorBack: [number, number, number, number];
  u_size: number;
  u_contrast: number;
  u_inverted: boolean;
  u_originalColors: boolean;
}

export interface AsciiArtParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  fontAtlas?: HTMLImageElement | string;
  colorFront?: string;
  colorBack?: string;
  size?: number;
  contrast?: number;
  inverted?: boolean;
  originalColors?: boolean;
}
