import type { ShaderMotionParams } from '../shader-mount.js';
import type { ShaderSizingParams, ShaderSizingUniforms } from '../shader-sizing.js';

// language=GLSL
export const heatmapFragSource: string = `#version 300 es
precision mediump float;

in vec2 v_imageUV;
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_time;
uniform float u_imageAspectRatio;
uniform float u_customParam;

vec2 get_img_uv() {
  vec2 img_uv = v_imageUV;
  img_uv -= .5;
  if (1. > u_imageAspectRatio) {
    img_uv.x = img_uv.x / u_imageAspectRatio;
  } else {
    img_uv.y = img_uv.y * u_imageAspectRatio;
  }
  img_uv += .5;

  return img_uv;
}

void main() {
  vec2 uv = v_imageUV;
  uv.y = 1. - uv.y;

  float t = u_time;
  
  vec2 img_uv = get_img_uv();
  vec4 img = texture(u_image, img_uv);

  img.g = u_customParam;
  img.b = (.5 + .5 * sin(t)) * img.r;

  fragColor = img;
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

      let padding = Math.floor(canvasSize * 0.16);
      let imgWidth: number;
      let imgHeight: number;

      if (ratio > 1) {
        imgWidth = canvasSize;
        imgHeight = Math.floor(canvasSize / ratio);
      } else {
        imgWidth = Math.floor(canvasSize * ratio);
        imgHeight = canvasSize;
      }

      canvas.width = imgWidth + 2 * padding;
      canvas.height = imgHeight + 2 * padding;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        throw new Error('Failed to get canvas 2d context');
      }

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'grayscale(100%)';
      ctx.filter = 'blur(' + Math.round(canvasSize / 13.5) + 'px)';
      ctx.drawImage(image, padding, padding, imgWidth, imgHeight);
      const bigBlurData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'blur(' + Math.round(canvasSize / 100) + 'px)';
      ctx.drawImage(image, padding, padding, imgWidth, imgHeight);
      const innerBlurSmallData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = 'blur(' + Math.round(canvasSize / 250) + 'px)';
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
  u_customParam: number;
}

export interface HeatmapParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | undefined;
  customParam?: number;
}
