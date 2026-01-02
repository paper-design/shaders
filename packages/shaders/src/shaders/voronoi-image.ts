import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, textureRandomizerGB } from '../shader-utils.js';

/**
 * Voronoi pattern where each cell samples its color from the image at the cell center.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_scale (float): Overall zoom level, used for anti-aliasing calculations
 * - u_gridScale (float): Scale of the voronoi grid only, independent of image (0.1 to 2)
 * - u_image (sampler2D): Source image texture
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorGap (vec4): Color used for cell borders/gaps in RGBA
 * - u_distortion (float): Strength of noise-driven displacement of cell centers (0 to 0.5)
 * - u_gap (float): Width of the border/gap between cells (0 to 0.1)
 * - u_noiseTexture (sampler2D): Pre-computed randomizer source texture
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): UV coordinates for image sampling with global sizing applied
 *
 * Vertex shader uniforms:
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_pixelRatio (float): Device pixel ratio
 * - u_originX (float): Reference point for positioning world width in the canvas (0 to 1)
 * - u_originY (float): Reference point for positioning world height in the canvas (0 to 1)
 * - u_worldWidth (float): Virtual width of the graphic before it's scaled to fit the canvas
 * - u_worldHeight (float): Virtual height of the graphic before it's scaled to fit the canvas
 * - u_fit (float): How to fit the rendered shader into the canvas dimensions (0 = none, 1 = contain, 2 = cover)
 * - u_scale (float): Overall zoom level of the graphics (0.01 to 4)
 * - u_rotation (float): Overall rotation angle of the graphics in degrees (0 to 360)
 * - u_offsetX (float): Horizontal offset of the graphics center (-1 to 1)
 * - u_offsetY (float): Vertical offset of the graphics center (-1 to 1)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 *
 */

// language=GLSL
export const voronoiImageFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_time;

uniform float u_scale;
uniform float u_gridScale;

uniform sampler2D u_noiseTexture;
uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec4 u_colorGap;
uniform float u_distortion;
uniform float u_gap;

in vec2 v_imageUV;

out vec4 fragColor;

${ declarePI }
${ textureRandomizerGB }

// Returns vec4(edge_distance, cell_center_x, cell_center_y, unused)
vec4 voronoi(vec2 x, float t) {
  vec2 ip = floor(x);
  vec2 fp = fract(x);

  vec2 mg, mr;
  float md = 8.;
  vec2 cellCenter = vec2(0.);

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = randomGB(ip + g);
      o = .5 + u_distortion * sin(t + TWO_PI * o);
      vec2 r = g + o - fp;
      float d = dot(r, r);

      if (d < md) {
        md = d;
        mr = r;
        mg = g;
        cellCenter = ip + g + o;
      }
    }
  }

  md = 8.;
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = randomGB(ip + g);
      o = .5 + u_distortion * sin(t + TWO_PI * o);
      vec2 r = g + o - fp;
      if (dot(mr - r, mr - r) > .00001) {
        md = min(md, dot(.5 * (mr + r), normalize(r - mr)));
      }
    }
  }

  return vec4(md, cellCenter, 0.);
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
  vec2 imageUV = v_imageUV;

  vec2 pad = vec2(1. / u_imageAspectRatio, 1.);
  float gridScaleFactor = mix(200., 10., u_gridScale);
  vec2 patternUV = (imageUV - .5) / pad * gridScaleFactor;

  float t = .2 * u_time;

  vec4 voronoiRes = voronoi(patternUV, t);
  float edgeDist = voronoiRes.x;
  vec2 cellCenter = voronoiRes.yz;

  // Convert cell center back to image UV coordinates (inverse of gridScale)
  vec2 cellCenterImageUV = cellCenter / gridScaleFactor * pad + .5;

  // Check if cell center is within image frame (0 to 1)
  float inFrame = getUvFrame(cellCenterImageUV, vec2(0.));

  // Sample the image at the cell center (transparent if out of frame)
  vec4 tex = texture(u_image, cellCenterImageUV);
  tex *= inFrame;

  vec3 cellColor = tex.rgb * tex.a;
  float cellOpacity = tex.a;

  // Edge calculation with screen-space anti-aliasing
  float aa = fwidth(edgeDist);
  float edge = smoothstep(u_gap - aa, u_gap + aa, edgeDist);

  vec3 color = mix(u_colorGap.rgb * u_colorGap.a, cellColor, edge);
  float opacity = mix(u_colorGap.a, cellOpacity, edge);

  fragColor = vec4(color, opacity);
}
`;

export interface VoronoiImageUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_colorGap: [number, number, number, number];
  u_gridScale: number;
  u_distortion: number;
  u_gap: number;
  u_noiseTexture?: HTMLImageElement;
}

export interface VoronoiImageParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string;
  colorGap?: string;
  gridScale?: number;
  distortion?: number;
  gap?: number;
}
