import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import type { ShaderSizingParams, ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, glslMod } from '../shader-utils.js';

export const heatmapMeta = {
  maxColorCount: 10,
} as const;

/**
 * A glowing gradient of colors flowing through an input shape.
 * The effect creates a smoothly animated wave of intensity across the image.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_image (sampler2D): Pre-processed source image texture (R = contour, G = outer blur, B = inner blur)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colors (vec4[]): Up to 10 heatmap colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_contour (float): Heat intensity near the edges of the input shape (0 to 1)
 * - u_angle (float): Direction of the heatwaves in degrees (0 to 360)
 * - u_noise (float): Grain applied across the entire graphic (0 to 1)
 * - u_innerGlow (float): Size of the heated area inside the input shape (0 to 1)
 * - u_outerGlow (float): Size of the heated area outside the input shape (0 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): UV coordinates for sampling the source image, with fit, scale, rotation, and offset applied
 * - v_objectUV (vec2): Object box UV coordinates with global sizing (scale, rotation, offsets, etc) applied
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

export const heatmapFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorBack: vec4f,
  u_colorsCount: f32,
  u_angle: f32,
  u_noise: f32,
  u_innerGlow: f32,
  u_outerGlow: f32,
  u_contour: f32,
  u_colors: array<vec4f, ${heatmapMeta.maxColorCount}>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

@group(1) @binding(0) var u_image_tex: texture_2d<f32>;
@group(1) @binding(1) var u_image_samp: sampler;

${declarePI}
${glslMod}

fn getImgFrame(uv: vec2f, th: f32) -> f32 {
  var frame: f32 = 1.0;
  frame *= smoothstep(0.0, th, uv.y);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);
  frame *= smoothstep(0.0, th, uv.x);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);
  return frame;
}

fn circle(uv: vec2f, c: vec2f, r: vec2f) -> f32 {
  return 1.0 - smoothstep(r[0], r[1], length(uv - c));
}

fn lst(edge0: f32, edge1: f32, x: f32) -> f32 {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

fn sst(edge0: f32, edge1: f32, x: f32) -> f32 {
  return smoothstep(edge0, edge1, x);
}

fn shadowShape(uv: vec2f, t: f32, contour: f32) -> f32 {
  var scaledUV = uv;

  // base shape tranjectory
  let posY = mix(-1.0, 2.0, t);

  // scaleX when it's moving down
  scaledUV = vec2f(scaledUV.x, scaledUV.y - 0.5);
  let mainCircleScale = sst(0.0, 0.8, posY) * lst(1.4, 0.9, posY);
  scaledUV *= vec2f(1.0, 1.0 + 1.5 * mainCircleScale);
  scaledUV = vec2f(scaledUV.x, scaledUV.y + 0.5);

  // base shape
  let innerR: f32 = 0.4;
  let outerR = 1.0 - 0.3 * (sst(0.1, 0.2, t) * (1.0 - sst(0.2, 0.5, t)));
  var s = circle(scaledUV, vec2f(0.5, posY - 0.2), vec2f(innerR, outerR));
  let shapeSizing = sst(0.2, 0.3, t) * sst(0.6, 0.3, t);
  s = pow(s, 1.4);
  s *= 1.2;

  // flat gradient to take over the shadow shape
  {
    let pos = posY - uv.y;
    let edge: f32 = 1.2;
    var topFlattener = lst(-0.4, 0.0, pos) * (1.0 - sst(0.0, edge, pos));
    topFlattener = pow(topFlattener, 3.0);
    let topFlattenerMixer = (1.0 - sst(0.0, 0.3, pos));
    s = mix(topFlattener, s, topFlattenerMixer);
  }

  // apple right circle
  {
    let visibility = sst(0.6, 0.7, t) * (1.0 - sst(0.8, 0.9, t));
    let angle = -2.0 - t * TWO_PI;
    var rightCircle = circle(uv, vec2f(0.95 - 0.2 * cos(angle), 0.4 - 0.1 * sin(angle)), vec2f(0.15, 0.3));
    rightCircle *= visibility;
    s = mix(s, 0.0, rightCircle);
  }

  // apple top circle
  {
    var topCircle = circle(uv, vec2f(0.5, 0.19), vec2f(0.05, 0.25));
    topCircle += 2.0 * contour * circle(uv, vec2f(0.5, 0.19), vec2f(0.2, 0.5));
    let visibility = 0.55 * sst(0.2, 0.3, t) * (1.0 - sst(0.3, 0.45, t));
    topCircle *= visibility;
    s = mix(s, 0.0, topCircle);
  }

  var leafMask = circle(uv, vec2f(0.53, 0.13), vec2f(0.08, 0.19));
  leafMask = mix(leafMask, 0.0, 1.0 - sst(0.4, 0.54, uv.x));
  leafMask = mix(0.0, leafMask, sst(0.0, 0.2, uv.y));
  leafMask *= (sst(0.5, 1.1, posY) * sst(1.5, 1.3, posY));
  s += leafMask;

  // apple bottom circle
  {
    let visibility = sst(0.0, 0.4, t) * (1.0 - sst(0.6, 0.8, t));
    s = mix(s, 0.0, visibility * circle(uv, vec2f(0.52, 0.92), vec2f(0.09, 0.25)));
  }

  // random balls that are invisible if apple logo is selected
  {
    let pos = sst(0.0, 0.6, t) * (1.0 - sst(0.6, 1.0, t));
    s = mix(s, 0.5, circle(uv, vec2f(0.0, 1.2 - 0.5 * pos), vec2f(0.1, 0.3)));
    s = mix(s, 0.0, circle(uv, vec2f(1.0, 0.5 + 0.5 * pos), vec2f(0.1, 0.3)));

    s = mix(s, 1.0, circle(uv, vec2f(0.95, 0.2 + 0.2 * sst(0.3, 0.4, t) * sst(0.7, 0.5, t)), vec2f(0.07, 0.22)));
    s = mix(s, 1.0, circle(uv, vec2f(0.95, 0.2 + 0.2 * sst(0.3, 0.4, t) * (1.0 - sst(0.5, 0.7, t))), vec2f(0.07, 0.22)));
    s /= max(1e-4, sst(1.0, 0.85, uv.y));
  }

  s = clamp(s, 0.0, 1.0);
  return s;
}

fn blurEdge3x3(uv: vec2f, radius: f32, centerSample: f32) -> f32 {
  let texDim = vec2f(textureDimensions(u_image_tex, 0));
  let texel = 1.0 / texDim;
  let r = radius * texel;

  let w1: f32 = 1.0;
  let w2: f32 = 2.0;
  let w4: f32 = 4.0;
  let norm: f32 = 16.0;
  var sum = w4 * centerSample;

  sum += w2 * textureSampleLevel(u_image_tex, u_image_samp, uv + vec2f(0.0, -r.y), 0.0).g;
  sum += w2 * textureSampleLevel(u_image_tex, u_image_samp, uv + vec2f(0.0, r.y), 0.0).g;
  sum += w2 * textureSampleLevel(u_image_tex, u_image_samp, uv + vec2f(-r.x, 0.0), 0.0).g;
  sum += w2 * textureSampleLevel(u_image_tex, u_image_samp, uv + vec2f(r.x, 0.0), 0.0).g;

  sum += w1 * textureSampleLevel(u_image_tex, u_image_samp, uv + vec2f(-r.x, -r.y), 0.0).g;
  sum += w1 * textureSampleLevel(u_image_tex, u_image_samp, uv + vec2f(r.x, -r.y), 0.0).g;
  sum += w1 * textureSampleLevel(u_image_tex, u_image_samp, uv + vec2f(-r.x, r.y), 0.0).g;
  sum += w1 * textureSampleLevel(u_image_tex, u_image_samp, uv + vec2f(r.x, r.y), 0.0).g;

  return sum / norm;
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  var uv = input.v_objectUV + vec2f(0.5);
  uv = vec2f(uv.x, 1.0 - uv.y);

  var imgUV = input.v_imageUV;
  imgUV -= vec2f(0.5);
  imgUV *= 0.5714285714285714;
  imgUV += vec2f(0.5);
  let imgSoftFrame = getImgFrame(imgUV, 0.03);

  var img = textureSampleLevel(u_image_tex, u_image_samp, imgUV, 0.0);

  if (img.a == 0.0) {
    return u.u_colorBack;
  }

  var t = 0.1 * u.u_time;
  t -= 0.3;

  var tCopy = t + 1.0 / 3.0;
  var tCopy2 = t + 2.0 / 3.0;

  t = glsl_mod_f32(t, 1.0);
  tCopy = glsl_mod_f32(tCopy, 1.0);
  tCopy2 = glsl_mod_f32(tCopy2, 1.0);

  var animationUV = imgUV - vec2f(0.5);
  let angle = -u.u_angle * PI / 180.0;
  let cosA = cos(angle);
  let sinA = sin(angle);
  animationUV = vec2f(
  animationUV.x * cosA - animationUV.y * sinA,
  animationUV.x * sinA + animationUV.y * cosA
  ) + vec2f(0.5);

  let shape = img[0];

  let img1_blurred = blurEdge3x3(imgUV, 8.0, img[1]);
  img = vec4f(img[0], img1_blurred, img[2], img[3]);

  var outerBlur = 1.0 - mix(1.0, img[1], shape);
  let innerBlur = mix(img[1], 0.0, shape);
  let contour_val = mix(img[2], 0.0, shape);

  outerBlur *= imgSoftFrame;

  let shadow = shadowShape(animationUV, t, innerBlur);
  let shadowCopy = shadowShape(animationUV, tCopy, innerBlur);
  let shadowCopy2 = shadowShape(animationUV, tCopy2, innerBlur);

  var inner = 0.8 + 0.8 * innerBlur;
  inner = mix(inner, 0.0, shadow);
  inner = mix(inner, 0.0, shadowCopy);
  inner = mix(inner, 0.0, shadowCopy2);

  inner *= mix(0.0, 2.0, u.u_innerGlow);

  inner += (u.u_contour * 2.0) * contour_val;
  inner = min(1.0, inner);
  inner *= (1.0 - shape);

  var outer: f32 = 0.0;
  {
    t *= 3.0;
    t = glsl_mod_f32(t - 0.1, 1.0);

    outer = 0.9 * pow(outerBlur, 0.8);
    let y = glsl_mod_f32(animationUV.y - t, 1.0);
    var animatedMask = sst(0.3, 0.65, y) * (1.0 - sst(0.65, 1.0, y));
    animatedMask = 0.5 + animatedMask;
    outer *= animatedMask;
    outer *= mix(0.0, 5.0, pow(u.u_outerGlow, 2.0));
    outer *= imgSoftFrame;
  }

  inner = pow(inner, 1.2);
  var heat = clamp(inner + outer, 0.0, 1.0);

  heat += (0.005 + 0.35 * u.u_noise) * (fract(sin(dot(uv, vec2f(12.9898, 78.233))) * 43758.5453123) - 0.5);

  let mixer = heat * u.u_colorsCount;
  var gradient = u.u_colors[0];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);
  var outerShape: f32 = 0.0;
  for (var i: i32 = 1; i < ${heatmapMeta.maxColorCount + 1}; i++) {
    if (i > i32(u.u_colorsCount)) { break; }
    let m = clamp(mixer - f32(i - 1), 0.0, 1.0);
    if (i == 1) {
      outerShape = m;
    }
    var c = u.u_colors[i - 1];
    c = vec4f(c.rgb * c.a, c.a);
    gradient = mix(gradient, c, m);
  }

  var color = gradient.rgb * outerShape;
  var opacity = gradient.a * outerShape;

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  color += vec3f(0.02 * (fract(sin(dot(uv + vec2f(1.0), vec2f(12.9898, 78.233))) * 43758.5453123) - 0.5));

  return vec4f(color, opacity);
}
`;

export function toProcessedHeatmap(file: File | string): Promise<{ blob: Blob }> {
  const canvas = document.createElement('canvas');
  const canvasSize = 1000;

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    image.addEventListener('load', () => {
      if (typeof file === 'string' ? file.endsWith('.svg') : file.type === 'image/svg+xml') {
        // Force SVG to load at a high fidelity size if it's an SVG
        image.width = canvasSize;
        image.height = canvasSize;
      }

      const ratio = image.naturalWidth / image.naturalHeight;

      const maxBlur = Math.floor(canvasSize * 0.15);
      const padding = Math.ceil(maxBlur * 2.5);
      let imgWidth = canvasSize;
      let imgHeight = canvasSize;
      if (ratio > 1) {
        imgHeight = Math.floor(canvasSize / ratio);
      } else {
        imgWidth = Math.floor(canvasSize * ratio);
      }

      canvas.width = imgWidth + 2 * padding;
      canvas.height = imgHeight + 2 * padding;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        throw new Error('Failed to get canvas 2d context');
      }

      // 1) Draw original image once, no filters
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, padding, padding, imgWidth, imgHeight);

      const { width, height } = canvas;
      const srcImageData = ctx.getImageData(0, 0, width, height);
      const src = srcImageData.data; // RGBA

      // 2) Build grayscale array (luma)
      const totalPixels = width * height;
      const gray = new Uint8ClampedArray(totalPixels);
      for (let i = 0; i < totalPixels; i++) {
        const px = i * 4;
        const r = src[px] ?? 0;
        const g = src[px + 1] ?? 0;
        const b = src[px + 2] ?? 0;
        // Standard luma conversion
        gray[i] = (0.299 * r + 0.587 * g + 0.114 * b) | 0;
      }

      // 3) Blur grayscale for each "filter" you previously used
      const bigBlurRadius = maxBlur;
      const innerBlurRadius = Math.max(1, Math.round(0.12 * maxBlur));
      const contourRadius = 5;

      const bigBlurGray = multiPassBlurGray(gray, width, height, bigBlurRadius, 3);
      const innerBlurGray = multiPassBlurGray(gray, width, height, innerBlurRadius, 3);
      const contourGray = multiPassBlurGray(gray, width, height, contourRadius, 1);

      // 4) Combine into final ImageData
      const processedImageData = ctx.createImageData(width, height);
      const dst = processedImageData.data;

      for (let i = 0; i < totalPixels; i++) {
        const px = i * 4;
        dst[px] = contourGray[i] ?? 0;
        dst[px + 1] = bigBlurGray[i] ?? 0;
        dst[px + 2] = innerBlurGray[i] ?? 0;
        dst[px + 3] = 255;
      }

      ctx.putImageData(processedImageData, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        resolve({ blob });
      }, 'image/png');
    });

    image.addEventListener('error', () => {
      reject(new Error('Failed to load image'));
    });

    image.src = typeof file === 'string' ? file : URL.createObjectURL(file);
  });
}

/**
 * Fast box blur for grayscale images using an integral image.
 * gray: Uint8ClampedArray of length width * height
 * radius: blur radius in pixels
 */
function blurGray(gray: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  if (radius <= 0) {
    return gray.slice();
  }

  const out = new Uint8ClampedArray(width * height);
  const integral = new Uint32Array(width * height);

  // Build integral image
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const v = gray[idx] ?? 0;
      rowSum += v;
      integral[idx] = rowSum + (y > 0 ? (integral[idx - width] ?? 0) : 0);
    }
  }

  // Blur using integral image
  for (let y = 0; y < height; y++) {
    const y1 = Math.max(0, y - radius);
    const y2 = Math.min(height - 1, y + radius);
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - radius);
      const x2 = Math.min(width - 1, x + radius);

      const idxA = y2 * width + x2;
      const idxB = y2 * width + (x1 - 1);
      const idxC = (y1 - 1) * width + x2;
      const idxD = (y1 - 1) * width + (x1 - 1);

      const A = integral[idxA] ?? 0;
      const B = x1 > 0 ? (integral[idxB] ?? 0) : 0;
      const C = y1 > 0 ? (integral[idxC] ?? 0) : 0;
      const D = x1 > 0 && y1 > 0 ? (integral[idxD] ?? 0) : 0;

      const sum = A - B - C + D;
      const area = (x2 - x1 + 1) * (y2 - y1 + 1);
      out[y * width + x] = Math.round(sum / area);
    }
  }

  return out;
}

function multiPassBlurGray(
  gray: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
  passes: number
): Uint8ClampedArray {
  if (radius <= 0 || passes <= 1) {
    return blurGray(gray, width, height, radius);
  }

  let input = gray;
  let tmp: Uint8ClampedArray = gray;

  for (let p = 0; p < passes; p++) {
    tmp = blurGray(input, width, height, radius);
    input = tmp;
  }

  return tmp;
}

export interface HeatmapUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string;
  u_contour: number;
  u_angle: number;
  u_noise: number;
  u_innerGlow: number;
  u_outerGlow: number;
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
}

export interface HeatmapParams extends ShaderSizingParams, ShaderMotionParams {
  image: HTMLImageElement | string;
  contour?: number;
  angle?: number;
  noise?: number;
  innerGlow?: number;
  outerGlow?: number;
  colorBack?: string;
  colors?: string[];
}
