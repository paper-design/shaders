import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, simplexNoise, colorBandingFix } from '../shader-utils.js';

/**
 *
 * Fluid motion imitation applied over user image
 * (animated stripe pattern getting distorted with shape edges)
 *
 * Uniforms:
 * - u_colorBack, u_colorTint (RGBA)
 * - u_repetition: density of pattern stripes
 * - u_softness: blur between stripes
 * - u_shiftRed & u_shiftBlue: color dispersion between the stripes
 * - u_distortion: pattern distortion on the whole canvas
 * - u_contour: distortion power over the shape edges
 * - u_shape (float used as integer):
 * ---- 0: canvas-screen rectangle, needs u_worldWidth = u_worldHeight = 0 to be responsive (see vertex shader)
 * ---- 1: static circle
 * ---- 2: animated flower-like polar shape
 * ---- 3: animated metaballs
 *
 */

// language=GLSL
export const imageLiquidMetalFragmentShader: string = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;

uniform float u_contourRoundness;
uniform float u_contourSoftness;
uniform float u_useOriginalAlpha;
uniform float u_edgePower;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${rotation2}
${simplexNoise}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {
  
  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  bump = smoothstep(.2, .8, bump);
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));
  
  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= smoothstep(1., 1. - th, uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= smoothstep(1., 1. - th, uv.x);
  return frame;
}

void main() {

  float t = .3 * u_time;

  vec2 uv = v_imageUV;
  float imgSoftFrame = getImgFrame(uv, .0);

  vec4 img = texture(u_image, v_imageUV);

  float cycleWidth = u_repetition;

  float mask = 1. - pow(img.r, u_edgePower);
  float contOffset = 1.;

  float opacity = 1.;
  if (u_useOriginalAlpha > .5) {
    opacity = img.g;
  } else {
    opacity = smoothstep(0., .5 * u_contourSoftness, img.r - u_contourRoundness);
  }
  
  opacity *= imgSoftFrame;

  float ridge = .18 * (smoothstep(.0, .2, uv.y) * smoothstep(.4, .2, uv.y));
  ridge += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));

  float diagBLtoTR = uv.x - uv.y;
  float diagTLtoBR = uv.x + uv.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  mask += (1. - mask) * u_distortion * noise;

  direction += diagBLtoTR;

  float contour = smoothstep(0., contOffset, mask) * smoothstep(contOffset, 0., mask);
  direction -= 2. * noise * diagBLtoTR * contour;

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - mask) * bump);
  direction *= smoothstep(1., .7, mask);

  direction += ridge;

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  float dispersionBlue = 1.3 * colorDispersion;

  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * smoothstep(.5, .1, uv.y)) * (smoothstep(.4, .6, bump) * smoothstep(1., .4, bump));
  dispersionRed -= diagBLtoTR;

  dispersionBlue += (smoothstep(0., .4, uv.y) * smoothstep(.8, .1, uv.y)) * (smoothstep(.4, .6, bump) * smoothstep(.8, .4, bump));
  dispersionBlue -= .2 * mask;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = u_softness / 20.;

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., mask + bump);
  float stripe_r = mod(direction + dispersionRed, 1.);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r), bump, u_colorTint.r);
  float stripe_g = mod(direction, 1.);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g), bump, u_colorTint.g);
  float stripe_b = mod(direction - dispersionBlue, 1.);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  float colorBackAlpha = u_colorBack.a;
  vec3 bgColor = u_colorBack.rgb * colorBackAlpha;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + colorBackAlpha* (1. - opacity);

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

export function toProcessedImageLiquidMetal(file: File | string): Promise<{ blob: Blob }> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    if (!file || !ctx) {
      reject(new Error('Invalid file or context'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      // Force SVG to load at a high fidelity size if it's an SVG
      if (typeof file === 'string' ? file.endsWith('.svg') : file.type === 'image/svg+xml') {
        img.width = 1000; // or whatever base size you prefer
        img.height = 1000;
      }

      const MAX_SIZE = 1000;
      const MIN_SIZE = 500;
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // Calculate new dimensions if image is too large or too small
      if (width > MAX_SIZE || height > MAX_SIZE || width < MIN_SIZE || height < MIN_SIZE) {
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (width < MIN_SIZE) {
            height = Math.round((height * MIN_SIZE) / width);
            width = MIN_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          } else if (height < MIN_SIZE) {
            width = Math.round((width * MIN_SIZE) / height);
            height = MIN_SIZE;
          }
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw the user image on an offscreen canvas.
      const shapeCanvas = document.createElement('canvas');
      shapeCanvas.width = width;
      shapeCanvas.height = height;
      const shapeCtx = shapeCanvas.getContext('2d')!;
      shapeCtx.drawImage(img, 0, 0, width, height);

      // 1) Build the inside/outside mask:
      // Non-shape pixels: pure white (255,255,255,255) or fully transparent.
      // Everything else is part of a shape.
      const shapeImageData = shapeCtx.getImageData(0, 0, width, height);
      const data = shapeImageData.data;
      const shapeMask = new Array(width * height).fill(false);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx4 = (y * width + x) * 4;
          const r = data[idx4];
          const g = data[idx4 + 1];
          const b = data[idx4 + 2];
          const a = data[idx4 + 3];
          if ((r === 255 && g === 255 && b === 255 && a === 255) || a === 0) {
            shapeMask[y * width + x] = false;
          } else {
            shapeMask[y * width + x] = true;
          }
        }
      }

      function inside(x: number, y: number) {
        if (x < 0 || x >= width || y < 0 || y >= height) return false;
        return shapeMask[y * width + x];
      }

      // 2) Identify boundary (pixels that have at least one non-shape neighbor)
      let boundaryMask = new Array(width * height).fill(false);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (!shapeMask[idx]) continue;
          let isBoundary = false;
          for (let ny = y - 1; ny <= y + 1 && !isBoundary; ny++) {
            for (let nx = x - 1; nx <= x + 1 && !isBoundary; nx++) {
              if (!inside(nx, ny)) {
                isBoundary = true;
              }
            }
          }
          if (isBoundary) {
            boundaryMask[idx] = true;
          }
        }
      }

      // 3) Poisson solve: Δu = -C (i.e. u_xx + u_yy = C), with u=0 at the boundary.
      const u = new Float32Array(width * height).fill(0);
      const newU = new Float32Array(width * height).fill(0);
      const C = 0.01;
      const ITERATIONS = 300;

      function getU(x: number, y: number, arr: Float32Array) {
        if (x < 0 || x >= width || y < 0 || y >= height) return 0;
        if (!shapeMask[y * width + x]) return 0;
        return arr[y * width + x]!;
      }

      for (let iter = 0; iter < ITERATIONS; iter++) {
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x;
            if (!shapeMask[idx] || boundaryMask[idx]) {
              newU[idx] = 0;
              continue;
            }
            const sumN = getU(x + 1, y, u) + getU(x - 1, y, u) + getU(x, y + 1, u) + getU(x, y - 1, u);
            newU[idx] = (C + sumN) / 4;
          }
        }
        // Swap u with newU
        for (let i = 0; i < width * height; i++) {
          u[i] = newU[i]!;
        }
      }

      // 4) Normalize the solution and apply a nonlinear remap.
      let maxVal = 0;
      for (let i = 0; i < width * height; i++) {
        if (u[i]! > maxVal) maxVal = u[i]!;
      }
      const outImg = ctx.createImageData(width, height);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const px = idx * 4;
          const raw = u[idx]! / maxVal;
          outImg.data[px] = 255 * raw;
          outImg.data[px + 1] = shapeImageData.data[px + 3] ?? 0;
          outImg.data[px + 2] = 255;
          outImg.data[px + 3] = 255;
        }
      }
      ctx.putImageData(outImg, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        resolve({
          blob,
        });
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = typeof file === 'string' ? file : URL.createObjectURL(file);
  });
}

export interface ImageLiquidMetalUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorTint: [number, number, number, number];
  u_image: HTMLImageElement | string | undefined;
  u_repetition: number;
  u_useOriginalAlpha: number;
  u_contourRoundness: number;
  u_contourSoftness: number;
  u_edgePower: number;
  u_softness: number;
  u_shiftRed: number;
  u_shiftBlue: number;
  u_distortion: number;
}

export interface ImageLiquidMetalParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorTint?: string;
  image?: HTMLImageElement | string | undefined;
  repetition?: number;
  shiftRed?: number;
  shiftBlue?: number;
  useOriginalAlpha?: number;
  contourRoundness?: number;
  contourSoftness?: number;
  edgePower?: number;
  softness?: number;
  distortion?: number;
}
