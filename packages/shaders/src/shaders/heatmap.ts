import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import type { ShaderSizingParams, ShaderSizingUniforms } from '../shader-sizing.js';

export const heatmapMeta = {
  maxColorCount: 10,
} as const;

// language=GLSL
export const heatmapFragmentShader: string = `#version 300 es
precision highp float;

in mediump vec2 v_imageUV;
in mediump vec2 v_objectUV;
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_time;
uniform float u_imageAspectRatio;

uniform vec4 u_colorBack;
uniform vec4 u_colors[${heatmapMeta.maxColorCount}];
uniform float u_colorsCount;

uniform float u_angle;
uniform float u_proportion;
uniform float u_noise;
uniform float u_inner;
uniform float u_outer;
uniform float u_contour;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= smoothstep(1., 1. - th, uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= smoothstep(1., 1. - th, uv.x);
  return frame;
}

float circle(vec2 uv, vec2 c, vec2 r) {
  return 1. - smoothstep(r[0], r[1], length(uv - c));
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

float shadowShape(vec2 uv, float t, float contour) {
  vec2 scaledUV = uv;

  // base shape tranjectory
  float posY = mix(-1., 2., t);

  // scaleX when it's moving down
  scaledUV.y -= .5;
  float mainCircleScale = sst(0., .8, posY) * lst(1.4, .9, posY);
  scaledUV *= vec2(1., 1. + 1.5 * mainCircleScale);
  scaledUV.y += .5;

  // base shape
  float innerR = .4;
  float outerR = 1. - .3 * (sst(.1, .2, t) * sst(.5, .2, t));
  float s = circle(scaledUV, vec2(.5, posY - .2), vec2(innerR, outerR));
  s = pow(s, 1.2);

  // flat gradient to take over the shadow shape
  float topFlattener = 0.;
  {
    float pos = posY - uv.y;
    float edge = 1.2;
    topFlattener = lst(-.4, 0., pos) * sst(edge, .0, pos);
    topFlattener = pow(topFlattener, 3.);
    float topFlattenerMixer = (1. - sst(.0, .3, pos));
    s = mix(topFlattener, s, topFlattenerMixer);
  }

  // apple right circle
  {
    float visibility = sst(.6, .7, t) * sst(.9, .8, t);
    float angle = -2. -t * TWO_PI;
    float rightCircle = circle(uv, vec2(.95 - .2 * cos(angle), .4 - .1 * sin(angle)), vec2(.15, .3));
    rightCircle *= visibility;
    s = mix(s, 0., rightCircle);
  }

  // apple top circle
  {
    float topCircle = circle(uv, vec2(.5, .19), vec2(.05, .25));
    topCircle += 2. * contour * circle(uv, vec2(.5, .19), vec2(.2, .5));
    float visibility = .4 * sst(.2, .3, t) * sst(.45, .3, t);
    topCircle *= visibility;
    s = mix(s, 0., topCircle);
  }

  // apple bottom circle
  {
    float visibility = sst(.0, .4, t) * sst(.8, .6, t);
    s = mix(s, 0., visibility * circle(uv, vec2(.52, .92), vec2(.09, .25)));
  }

  // random balls that are invisible if apple logo is selected
  {
    float pos = sst(.0, .6, t) * sst(1., .6, t);
    s = mix(s, .5, circle(uv, vec2(.0, 1.2 - .5 * pos), vec2(.1, .3)));
    s = mix(s, .0, circle(uv, vec2(1., .5 + .5 * pos), vec2(.1, .3)));

    s = mix(s, 1., circle(uv, vec2(.95, .2 + .2 * sst(.3, .4, t) * sst(.7, .5, t)), vec2(.07, .22)));
    s /= sst(1., .85, uv.y);
  }

  s = clamp(0., 1., s);
  return s;
}


void main() {
  vec2 uv = v_objectUV + .5;
  uv.y = 1. - uv.y;

  vec2 imgUV = v_imageUV;
  float imgSoftFrame = getImgFrame(imgUV, .03);
  
  vec4 img = texture(u_image, imgUV);
  if (img.a == 0.) {
    fragColor = u_colorBack;
    return;
  }

  float t = .1 * u_time;

  float tCopy = t + 1. / 3.;
  float tCopy2 = t + 2. / 3.;

  t = mod(t, 1.);
  tCopy = mod(tCopy, 1.);
  tCopy2 = mod(tCopy2, 1.);

  vec2 animationUV = imgUV - vec2(.5);
  float angle = u_angle * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  animationUV = vec2(
  animationUV.x * cosA - animationUV.y * sinA,
  animationUV.x * sinA + animationUV.y * cosA
  ) + vec2(.5);

  float shape = img[0];
  float outerBlur = 1. - mix(1., img[1], shape);
  float innerBlur = mix(img[1], 0., shape);
  float contour = mix(img[2], 0., shape);

  outerBlur *= imgSoftFrame;

  float shadow = shadowShape(animationUV, t, innerBlur);
  float shadowCopy = shadowShape(animationUV, tCopy, innerBlur);
  float shadowCopy2 = shadowShape(animationUV, tCopy2, innerBlur);

  float inner = .8 + .8 * innerBlur;
  inner = mix(inner, 0., shadow);
  inner = mix(inner, 0., shadowCopy);
  inner = mix(inner, 0., shadowCopy2);

  float leafMask = circle(animationUV, vec2(.53, .1), vec2(.1, .25));
  inner -= .2 * leafMask;

  inner *= mix(0., 2., u_inner);

  inner += (u_contour * 2.) * contour;
  inner = min(1., inner);
  inner *= (1. - shape);

  float outer = 0.;
  {
    t *= 3.;
    t = mod(t - .2, 1.);

    outer = outerBlur;
    float animatedMask = sst(.1, .65, mod(animationUV.y - t, 1.)) * sst(1., .65, mod(animationUV.y - t, 1.));
    animatedMask = .5 + animatedMask;
    outer *= animatedMask;
    outer *= mix(0., 5., pow(u_outer, 2.));
    outer *= imgSoftFrame;
  }

  float proportion = clamp(u_proportion, 0., 1.) - .5;
  float heat = clamp(inner + outer + proportion, 0., 1.);

  heat += (.005 + .35 * u_noise) * (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123) - .5);

  float mixer = heat * u_colorsCount;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;
  float outerShape = 0.;
  for (int i = 1; i < ${heatmapMeta.maxColorCount + 1}; i++) {
    if (i > int(u_colorsCount)) break;
    float m = clamp(mixer - float(i - 1), 0., 1.);
    if (i == 1) {
      outerShape = m;
    }
    vec4 c = u_colors[i - 1];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb * outerShape;
  float opacity = gradient.a * outerShape;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

  color += .02 * (fract(sin(dot(uv + 1., vec2(12.9898, 78.233))) * 43758.5453123) - .5);

  //  color.r += .2 * imgSoftFrame;

  fragColor = vec4(color, 1.);
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

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'grayscale(100%) blur(' + maxBlur + 'px)';
      ctx.drawImage(image, padding, padding, imgWidth, imgHeight);
      const bigBlurData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'grayscale(100%) blur(' + Math.round(0.12 * maxBlur) + 'px)';
      ctx.drawImage(image, padding, padding, imgWidth, imgHeight);
      const innerBlurSmallData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'grayscale(100%) blur(5px)';
      ctx.drawImage(image, padding, padding, imgWidth, imgHeight);
      const contourData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let processedImageData = ctx.createImageData(canvas.width, canvas.height);
      const totalPixels = canvas.width * canvas.height;
      for (let i = 0; i < totalPixels; i++) {
        const px = i * 4;
        processedImageData.data[px] = contourData[px]!;
        processedImageData.data[px + 1] = bigBlurData[px]!;
        processedImageData.data[px + 2] = innerBlurSmallData[px]!;
        processedImageData.data[px + 3] = 255;
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

export interface HeatmapUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_contour: number;
  u_angle: number;
  u_proportion: number;
  u_noise: number;
  u_inner: number;
  u_outer: number;
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
}

export interface HeatmapParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | undefined;
  contour?: number;
  angle?: number;
  proportion?: number;
  noise?: number;
  inner?: number;
  outer?: number;
  colorBack?: string;
  colors?: string[];
}
