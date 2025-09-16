import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';

export const liquidFragmentShader: string = /* glsl */ `#version 300 es
precision mediump float;

out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_time;
uniform float u_imageAspectRatio;

uniform float u_patternScale;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;

${sizingVariablesDeclaration}

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
    m = m*m;
    m = m*m;
    vec3 x = 2. * fract(p * C.www) - 1.;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130. * dot(m, g);
}

vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
    float ch = c2;
    float border = 0.;
    float blur = u_patternBlur + extra_blur;

    ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));

    border = w[0];
    ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));

    b = smoothstep(.2, .8, b);
    border = w[0] + .4 * (1. - b) * w[1];
    ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));

    border = w[0] + .5 * (1. - b) * w[1];
    ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));

    border = w[0] + w[1];
    ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));

    float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
    float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
    ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));

    return ch;
}

float get_img_frame_alpha(vec2 uv, float img_frame_width) {
    float img_frame_alpha = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
    img_frame_alpha *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
    return img_frame_alpha;
}

void main() {
    vec2 uv = v_imageUV;
    uv.y = 1. - uv.y;
    uv.x *= u_ratio;

    float diagonal = uv.x - uv.y;

    float t = .001 * u_time;

    vec4 img = texture(u_image, v_imageUV);

    vec3 color = vec3(0.);
    float opacity = 1.;

    vec3 color1 = vec3(.98, 0.98, 1.);
    vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, uv.x + uv.y));

    float edge = img.r;

    vec2 grad_uv = uv;
    grad_uv -= .5;

    float dist = length(grad_uv + vec2(0., .2 * diagonal));

    grad_uv = rotate(grad_uv, (.25 - .2 * diagonal) * PI);

    float bulge = pow(1.8 * dist, 1.2);
    bulge = 1. - bulge;
    bulge *= pow(uv.y, .3);

    float cycle_width = u_patternScale;
    float thin_strip_1_ratio = .12 / cycle_width * (1. - .4 * bulge);
    float thin_strip_2_ratio = .07 / cycle_width * (1. + .4 * bulge);
    float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

    float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
    float thin_strip_2_width = cycle_width * thin_strip_2_ratio;

    opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);
    opacity *= get_img_frame_alpha(v_imageUV, 0.01);


    float noise = snoise(uv - t);

    edge += (1. - edge) * u_liquid * noise;

    float refr = 0.;
    refr += (1. - bulge);
    refr = clamp(refr, 0., 1.);

    float dir = grad_uv.x;


    dir += diagonal;

    dir -= 2. * noise * diagonal * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));

    bulge *= clamp(pow(uv.y, .1), .3, 1.);
    dir *= (.1 + (1.1 - edge) * bulge);

    dir *= smoothstep(1., .7, edge);

    dir += .18 * (smoothstep(.1, .2, uv.y) * smoothstep(.4, .2, uv.y));
    dir += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));

    dir *= (.5 + .5 * pow(uv.y, 2.));

    dir *= cycle_width;

    dir -= t;

    float refr_r = refr;
    refr_r += .03 * bulge * noise;
    float refr_b = 1.3 * refr;

    refr_r += 5. * (smoothstep(-.1, .2, uv.y) * smoothstep(.5, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(1., .4, bulge));
    refr_r -= diagonal;

    refr_b += (smoothstep(0., .4, uv.y) * smoothstep(.8, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.8, .4, bulge));
    refr_b -= .2 * edge;

    refr_r *= u_refraction;
    refr_b *= u_refraction;

    vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
    w[1] -= .02 * smoothstep(.0, 1., edge + bulge);
    float stripe_r = mod(dir + refr_r, 1.);
    float r = get_color_channel(color1.r, color2.r, stripe_r, w, 0.02 + .03 * u_refraction * bulge, bulge);
    float stripe_g = mod(dir, 1.);
    float g = get_color_channel(color1.g, color2.g, stripe_g, w, 0.01 / (1. - diagonal), bulge);
    float stripe_b = mod(dir - refr_b, 1.);
    float b = get_color_channel(color1.b, color2.b, stripe_b, w, .01, bulge);

    color = vec3(r, g, b);

    color *= opacity;

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
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var idx4 = (y * width + x) * 4;
          var r = data[idx4];
          var g = data[idx4 + 1];
          var b = data[idx4 + 2];
          var a = data[idx4 + 3];
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
      var boundaryMask = new Array(width * height).fill(false);
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var idx = y * width + x;
          if (!shapeMask[idx]) continue;
          var isBoundary = false;
          for (var ny = y - 1; ny <= y + 1 && !isBoundary; ny++) {
            for (var nx = x - 1; nx <= x + 1 && !isBoundary; nx++) {
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
      var u = new Float32Array(width * height).fill(0);
      var newU = new Float32Array(width * height).fill(0);
      var C = 0.01;
      var ITERATIONS = 300;

      function getU(x: number, y: number, arr: Float32Array) {
        if (x < 0 || x >= width || y < 0 || y >= height) return 0;
        if (!shapeMask[y * width + x]) return 0;
        return arr[y * width + x]!;
      }

      for (var iter = 0; iter < ITERATIONS; iter++) {
        for (var y = 0; y < height; y++) {
          for (var x = 0; x < width; x++) {
            var idx = y * width + x;
            if (!shapeMask[idx] || boundaryMask[idx]) {
              newU[idx] = 0;
              continue;
            }
            var sumN = getU(x + 1, y, u) + getU(x - 1, y, u) + getU(x, y + 1, u) + getU(x, y - 1, u);
            newU[idx] = (C + sumN) / 4;
          }
        }
        // Swap u with newU
        for (var i = 0; i < width * height; i++) {
          u[i] = newU[i]!;
        }
      }

      // 4) Normalize the solution and apply a nonlinear remap.
      var maxVal = 0;
      for (var i = 0; i < width * height; i++) {
        if (u[i]! > maxVal) maxVal = u[i]!;
      }
      const alpha = 2.0; // Adjust for contrast.
      const outImg = ctx.createImageData(width, height);

      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var idx = y * width + x;
          var px = idx * 4;
          if (!shapeMask[idx]) {
            outImg.data[px] = 255;
            outImg.data[px + 1] = 255;
            outImg.data[px + 2] = 255;
            outImg.data[px + 3] = 255;
          } else {
            const raw = u[idx]! / maxVal;
            const remapped = Math.pow(raw, alpha);
            const gray = 255 * (1 - remapped);
            outImg.data[px] = gray;
            outImg.data[px + 1] = gray;
            outImg.data[px + 2] = gray;
            outImg.data[px + 3] = 255;
          }
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
  u_image: HTMLImageElement | string | undefined;
}

export interface ImageLiquidMetalParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | undefined;
}
