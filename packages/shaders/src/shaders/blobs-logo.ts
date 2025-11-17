import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2, proceduralHash21, colorBandingFix } from '../shader-utils.js';

export const blobsLogoMeta = {
  maxColorCount: 6,
} as const;

/**
 *
 * Fluid motion imitation applied over user image
 * (animated stripe pattern getting distorted with shape edges)
 *
 * Uniforms:
 * - u_colorBack, u_colorFront (RGBA)
 *
 */

// language=GLSL
export const blobsLogoFragmentShader: string = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colors[${blobsLogoMeta.maxColorCount}];
uniform float u_colorsCount;
uniform vec4 u_colorBack;
uniform vec4 u_colorInner;
uniform float u_contour;
uniform float u_size;

${sizingVariablesDeclaration}

out vec4 fragColor;

${ declarePI }
${ rotation2 }

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge5x5(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = max(radius, 0.0) * texel;

  // 1D Gaussian coefficients (Pascal row)
  const float a = 1.0;// |offset| = 2
  const float b = 4.0;// |offset| = 1
  const float c = 6.0;// |offset| = 0

  float norm = 256.0;// (a+b+c+b+a)^2 = 16^2
  float sum  = 0.0;

  // y = -2
  {
    float wy = a;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, -2.0*r.y)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, -2.0*r.y)).r +
    c * texture(tex, uv + vec2(0.0, -2.0*r.y)).r +
    b * texture(tex, uv + vec2(1.0*r.x, -2.0*r.y)).r +
    a * texture(tex, uv + vec2(2.0*r.x, -2.0*r.y)).r;
    sum += wy * row;
  }

  // y = -1
  {
    float wy = b;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, -1.0*r.y)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, -1.0*r.y)).r +
    c * texture(tex, uv + vec2(0.0, -1.0*r.y)).r +
    b * texture(tex, uv + vec2(1.0*r.x, -1.0*r.y)).r +
    a * texture(tex, uv + vec2(2.0*r.x, -1.0*r.y)).r;
    sum += wy * row;
  }

  // y = 0 (use provided centerSample to avoid an extra fetch)
  {
    float wy = c;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, 0.0)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, 0.0)).r +
    c * centerSample +
    b * texture(tex, uv + vec2(1.0*r.x, 0.0)).r +
    a * texture(tex, uv + vec2(2.0*r.x, 0.0)).r;
    sum += wy * row;
  }

  // y = +1
  {
    float wy = b;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, 1.0*r.y)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, 1.0*r.y)).r +
    c * texture(tex, uv + vec2(0.0, 1.0*r.y)).r +
    b * texture(tex, uv + vec2(1.0*r.x, 1.0*r.y)).r +
    a * texture(tex, uv + vec2(2.0*r.x, 1.0*r.y)).r;
    sum += wy * row;
  }

  // y = +2
  {
    float wy = a;
    float row =
    a * texture(tex, uv + vec2(-2.0*r.x, 2.0*r.y)).r +
    b * texture(tex, uv + vec2(-1.0*r.x, 2.0*r.y)).r +
    c * texture(tex, uv + vec2(0.0, 2.0*r.y)).r +
    b * texture(tex, uv + vec2(1.0*r.x, 2.0*r.y)).r +
    a * texture(tex, uv + vec2(2.0*r.x, 2.0*r.y)).r;
    sum += wy * row;
  }

  return sum / norm;
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

float getPoint(vec2 dist, float p) {
  float v = pow(1. - clamp(0., 1., length(dist)), 1.);
  v = smoothstep(0., 1., v);
  v = pow(v, p);
  return v;
}


void main() {

  float t = .3 * u_time;

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  float edge = img.r;
  edge = 1. - blurEdge5x5(u_image, uv, dudx, dudy, 10., edge);

  float imgAlpha = img.g;

  float frame = getImgFrame(v_imageUV, 0.);
  imgAlpha *= frame;
  edge *= frame;

  uv = v_objectUV;
  
  float offset = 1. - edge;
  float shadow = ((1. - edge) * imgAlpha);
  shadow = pow(shadow, 5.);

  float shapeOffset = 2.4 * u_contour * offset;
  float shaping = 2.5 - shapeOffset;

  t = 2. * u_time;
  float f[${ blobsLogoMeta.maxColorCount }];

  vec2 trajs[${ blobsLogoMeta.maxColorCount }];
  trajs[0] = vec2(0.8 * sin(-0.5 * t), 0.2 + 2.5 * cos(0.3 * t));
  trajs[1] = vec2(1.7 * cos(-0.5 * t + 1.), sin(0.8 * t));
  trajs[2] = vec2(0.5 * cos(0.3 * t), cos(-0.8 * t));
  trajs[3] = vec2(0.5 * cos(-0.9 * t), 0.7 * sin(-0.2 * t));
  trajs[4] = vec2(0.5 * sin(-0.34 * t), -.2 + 1.3 * sin(-0.8 * t));
  trajs[5] = vec2(0.9 * sin(0.85 * t + 1.), 0.7 * cos(0.6 * t));

  float dist = 0.3;
  for (int i = 0; i < ${ blobsLogoMeta.maxColorCount }; i++) {
    dist += .03 * float(i);
    f[i] = getPoint(uv + dist * trajs[i], shaping);
  }

  f[0] -= f[1];
  f[2] -= 1.2 * f[1];
  f[2] -= 1.6 * f[0];
  f[4] -= f[1];
  f[5] -= .4 * f[3];
  f[1] -= .5 * f[2];
  f[5] -= f[4];
  f[3] -= f[1];
  f[3] -= f[2];
  f[5] *= .3;

  float opacity = 0.;
  vec3 color = vec3(0.);

  float size = .95 - .9 * u_size;
  for (int i = 0; i < ${ blobsLogoMeta.maxColorCount }; i++) {
    if (i >= int(u_colorsCount)) break;
    f[i] = sst(size, size + 2. * fwidth(f[i]), f[i]);
    opacity += f[i];
    color = mix(color, u_colors[i].rgb, f[i]);
  }

  opacity = clamp(opacity, 0., 1.);

  color *= imgAlpha;
  opacity *= imgAlpha;
  
  vec3  backRgb = u_colorBack.rgb * u_colorBack.a;
  float backA   = u_colorBack.a;
  vec3  innerRgb_raw = u_colorInner.rgb * u_colorInner.a;
  float innerA_raw = u_colorInner.a;

  float innerA  = innerA_raw * imgAlpha;
  vec3  innerRgb = innerRgb_raw * imgAlpha;

  vec3  layerRgb = innerRgb + backRgb * (1.0 - innerA);
  float layerA   = innerA   + backA   * (1.0 - innerA);

  vec3 colorCopy = color;
  color   = color   + layerRgb * (1.0 - opacity);
  opacity = opacity + layerA   * (1.0 - opacity);


  fragColor = vec4(color, opacity);
}
`;

// Configuration for Poisson solver
export const POISSON_CONFIG_OPTIMIZED = {
  measurePerformance: false, // Set to true to see performance metrics
  workingSize: 512, // Size to solve Poisson at (will upscale to original size)
  iterations: 32, // SOR converges ~2-20x faster than standard Gauss-Seidel
};

// Precomputed pixel data for sparse processing
interface SparsePixelData {
  interiorPixels: Uint32Array; // Indices of interior pixels
  boundaryPixels: Uint32Array; // Indices of boundary pixels
  pixelCount: number;
  // Neighbor indices for each interior pixel (4 neighbors per pixel)
  // Layout: [east, west, north, south] for each pixel
  neighborIndices: Int32Array;
}

export function toProcessedBlobsLogo(file: File | string): Promise<{ imageData: ImageData; pngBlob: Blob }> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const isBlob = typeof file === 'string' && file.startsWith('blob:');

  return new Promise((resolve, reject) => {
    if (!file || !ctx) {
      reject(new Error('Invalid file or canvas context'));
      return;
    }

    const blobContentTypePromise = isBlob && fetch(file).then((res) => res.headers.get('Content-Type'));
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const totalStartTime = performance.now();

    img.onload = async () => {
      // Force SVG to load at a high fidelity size if it's an SVG
      let isSVG;

      const blobContentType = await blobContentTypePromise;

      if (blobContentType) {
        isSVG = blobContentType === 'image/svg+xml';
      } else if (typeof file === 'string') {
        isSVG = file.endsWith('.svg') || file.startsWith('data:image/svg+xml');
      } else {
        isSVG = file.type === 'image/svg+xml';
      }

      let originalWidth = img.width || img.naturalWidth;
      let originalHeight = img.height || img.naturalHeight;

      if (isSVG) {
        // Scale SVG to max dimension while preserving aspect ratio
        const svgMaxSize = 4096;
        const aspectRatio = originalWidth / originalHeight;

        if (originalWidth > originalHeight) {
          originalWidth = svgMaxSize;
          originalHeight = svgMaxSize / aspectRatio;
        } else {
          originalHeight = svgMaxSize;
          originalWidth = svgMaxSize * aspectRatio;
        }

        img.width = originalWidth;
        img.height = originalHeight;
      }

      // Always scale to working resolution for consistency
      const minDimension = Math.min(originalWidth, originalHeight);
      const targetSize = POISSON_CONFIG_OPTIMIZED.workingSize;

      // Calculate scale to fit within workingSize
      const scaleFactor = targetSize / minDimension;
      const width = Math.round(originalWidth * scaleFactor);
      const height = Math.round(originalHeight * scaleFactor);

      if (POISSON_CONFIG_OPTIMIZED.measurePerformance) {
        console.log(`[Processing Mode]`);
        console.log(`  Original: ${originalWidth}×${originalHeight}`);
        console.log(`  Working: ${width}×${height} (${(scaleFactor * 100).toFixed(1)}% scale)`);
        if (scaleFactor < 1) {
          console.log(`  Speedup: ~${Math.round(1 / (scaleFactor * scaleFactor))}×`);
        }
      }

      canvas.width = originalWidth;
      canvas.height = originalHeight;

      // Use a smaller canvas for shape detection and Poisson solving
      const shapeCanvas = document.createElement('canvas');
      shapeCanvas.width = width;
      shapeCanvas.height = height;

      const shapeCtx = shapeCanvas.getContext('2d')!;
      shapeCtx.drawImage(img, 0, 0, width, height);

      // 1) Build optimized masks using TypedArrays
      const startMask = performance.now();

      const shapeImageData = shapeCtx.getImageData(0, 0, width, height);
      const data = shapeImageData.data;

      // Use Uint8Array for masks (1 byte per pixel vs 8+ bytes for boolean array)
      const shapeMask = new Uint8Array(width * height);
      const boundaryMask = new Uint8Array(width * height);

      // First pass: identify shape pixels
      let shapePixelCount = 0;
      for (let i = 0, idx = 0; i < data.length; i += 4, idx++) {
        const a = data[i + 3];
        const isShape = a === 0 ? 0 : 1;
        shapeMask[idx] = isShape;
        shapePixelCount += isShape;
      }

      // 2) Optimized boundary detection using sparse approach
      // Only check shape pixels, not all pixels
      const boundaryIndices: number[] = [];
      const interiorIndices: number[] = [];

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (!shapeMask[idx]) continue;

          // Check if pixel is on boundary (optimized: early exit)
          let isBoundary = false;

          // Check 4-connected neighbors first (most common case)
          if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
            isBoundary = true;
          } else {
            // Check all 8 neighbors (including diagonals) for comprehensive boundary detection
            isBoundary =
              !shapeMask[idx - 1] || // left
              !shapeMask[idx + 1] || // right
              !shapeMask[idx - width] || // top
              !shapeMask[idx + width] || // bottom
              !shapeMask[idx - width - 1] || // top-left
              !shapeMask[idx - width + 1] || // top-right
              !shapeMask[idx + width - 1] || // bottom-left
              !shapeMask[idx + width + 1]; // bottom-right
          }

          if (isBoundary) {
            boundaryMask[idx] = 1;
            boundaryIndices.push(idx);
          } else {
            interiorIndices.push(idx);
          }
        }
      }

      if (POISSON_CONFIG_OPTIMIZED.measurePerformance) {
        console.log(`[Mask Building] Time: ${(performance.now() - startMask).toFixed(2)}ms`);
        console.log(
          `  Shape pixels: ${shapePixelCount} / ${width * height} (${((shapePixelCount / (width * height)) * 100).toFixed(1)}%)`
        );
        console.log(`  Interior pixels: ${interiorIndices.length}`);
        console.log(`  Boundary pixels: ${boundaryIndices.length}`);
      }

      // 3) Precompute sparse data structure for solver
      const sparseData = buildSparseData(
        shapeMask,
        boundaryMask,
        new Uint32Array(interiorIndices),
        new Uint32Array(boundaryIndices),
        width,
        height
      );

      // 4) Solve Poisson equation with optimized sparse solver
      const startSolve = performance.now();
      const u = solvePoissonSparse(sparseData, shapeMask, boundaryMask, width, height);

      if (POISSON_CONFIG_OPTIMIZED.measurePerformance) {
        console.log(`[Poisson Solve] Time: ${(performance.now() - startSolve).toFixed(2)}ms`);
      }

      // 5) Generate output image
      let maxVal = 0;
      let finalImageData: ImageData;

      // Only check shape pixels for max value
      for (let i = 0; i < interiorIndices.length; i++) {
        const idx = interiorIndices[i]!;
        if (u[idx]! > maxVal) maxVal = u[idx]!;
      }

      // Create roundness image at working resolution
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d')!;

      const tempImg = tempCtx.createImageData(width, height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const px = idx * 4;

          if (!shapeMask[idx]) {
            tempImg.data[px] = 255;
            tempImg.data[px + 1] = 255;
            tempImg.data[px + 2] = 255;
            tempImg.data[px + 3] = 0; // Alpha = 0 for background
          } else {
            const poissonRatio = u[idx]! / maxVal;
            let gray = 255 * (1 - poissonRatio);
            tempImg.data[px] = gray;
            tempImg.data[px + 1] = gray;
            tempImg.data[px + 2] = gray;
            tempImg.data[px + 3] = 255; // Alpha = 255 for shape
          }
        }
      }
      tempCtx.putImageData(tempImg, 0, 0);

      // Upscale to original resolution with smooth interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, originalWidth, originalHeight);

      // Now get the upscaled image data for final output
      const outImg = ctx.getImageData(0, 0, originalWidth, originalHeight);

      // Re-apply edges from original resolution with anti-aliasing
      // This ensures edges are pixel-perfect while roundness is smooth
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = originalWidth;
      originalCanvas.height = originalHeight;
      const originalCtx = originalCanvas.getContext('2d')!;
      // originalCtx.fillStyle = "white";
      // originalCtx.fillRect(0, 0, originalWidth, originalHeight);
      originalCtx.drawImage(img, 0, 0, originalWidth, originalHeight);
      const originalData = originalCtx.getImageData(0, 0, originalWidth, originalHeight);

      // Process each pixel: Red channel = roundness, Alpha channel = original alpha
      for (let i = 0; i < outImg.data.length; i += 4) {
        const a = originalData.data[i + 3]!;
        // Use only alpha to determine background vs shape
        const upscaledAlpha = outImg.data[i + 3]!;
        if (a === 0) {
          // Background pixel
          outImg.data[i] = 255;
          outImg.data[i + 1] = 0;
        } else {
          // Red channel carries the roundness
          // Check if upscale missed this pixel by looking at alpha channel
          // If upscaled alpha is 0, the low-res version thought this was background
          outImg.data[i] = upscaledAlpha === 0 ? 0 : outImg.data[i]!; // roundness or 0
          outImg.data[i + 1] = a; // original alpha
        }

        // Unused channels fixed
        outImg.data[i + 2] = 255;
        outImg.data[i + 3] = 255;
      }

      ctx.putImageData(outImg, 0, 0);
      finalImageData = outImg;
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }

        if (POISSON_CONFIG_OPTIMIZED.measurePerformance) {
          const totalTime = performance.now() - totalStartTime;
          console.log(`[Total Processing Time] ${totalTime.toFixed(2)}ms`);
          if (scaleFactor < 1) {
            const estimatedFullResTime = totalTime * Math.pow((originalWidth * originalHeight) / (width * height), 1.5);
            console.log(`[Estimated time at full resolution] ~${estimatedFullResTime.toFixed(0)}ms`);
            console.log(
              `[Time saved] ~${(estimatedFullResTime - totalTime).toFixed(0)}ms (${Math.round(estimatedFullResTime / totalTime)}× faster)`
            );
          }
        }

        resolve({
          imageData: finalImageData,
          pngBlob: blob,
        });
      }, 'image/png');
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = typeof file === 'string' ? file : URL.createObjectURL(file);
  });
}

function blurRedChannel(
    imageData: ImageData,
    width: number,
    height: number,
    radius = 2
) {
  const src = imageData.data;
  const pixelCount = width * height;

  const tmp = new Uint8ClampedArray(pixelCount);
  const dst = new Uint8ClampedArray(pixelCount);

  // --- Horizontal blur ---
  for (let y = 0; y < height; y++) {
    let sum = 0;
    let count = 0;

    // initial window centered at x = 0
    for (let dx = -radius; dx <= radius; dx++) {
      const xClamped = Math.max(0, Math.min(width - 1, dx));
      const idx = (y * width + xClamped) * 4;
      sum += src[idx]!;
      count++;
    }

    for (let x = 0; x < width; x++) {
      const outIdx = y * width + x;
      tmp[outIdx] = sum / count;

      const xRemove = x - radius;
      if (xRemove >= 0) {
        const idxRemove = (y * width + xRemove) * 4;
        sum -= src[idxRemove]!;
        count--;
      }

      const xAdd = x + radius + 1;
      if (xAdd < width) {
        const idxAdd = (y * width + xAdd) * 4;
        sum += src[idxAdd]!;
        count++;
      }
    }
  }

  // --- Vertical blur ---
  for (let x = 0; x < width; x++) {
    let sum = 0;
    let count = 0;

    // initial window centered at y = 0
    for (let dy = -radius; dy <= radius; dy++) {
      const yClamped = Math.max(0, Math.min(height - 1, dy));
      const idx = yClamped * width + x;
      sum += tmp[idx]!;
      count++;
    }

    for (let y = 0; y < height; y++) {
      const outIdx = y * width + x;
      dst[outIdx] = sum / count;

      const yRemove = y - radius;
      if (yRemove >= 0) {
        const idxRemove = yRemove * width + x;
        sum -= tmp[idxRemove]!;
        count--;
      }

      const yAdd = y + radius + 1;
      if (yAdd < height) {
        const idxAdd = yAdd * width + x;
        sum += tmp[idxAdd]!;
        count++;
      }
    }
  }

  // --- Write blurred red back into ImageData ---
  for (let i = 0; i < pixelCount; i++) {
    const px = i * 4;
    src[px] = dst[i]!;
  }
}


function buildSparseData(
  shapeMask: Uint8Array,
  boundaryMask: Uint8Array,
  interiorPixels: Uint32Array,
  boundaryPixels: Uint32Array,
  width: number,
  height: number
): SparsePixelData {
  const pixelCount = interiorPixels.length;

  // Build neighbor indices for sparse processing
  // For each interior pixel, store indices of its 4 neighbors
  // Use -1 for out-of-bounds or non-shape neighbors
  const neighborIndices = new Int32Array(pixelCount * 4);

  for (let i = 0; i < pixelCount; i++) {
    const idx = interiorPixels[i]!;
    const x = idx % width;
    const y = Math.floor(idx / width);

    // East neighbor
    neighborIndices[i * 4 + 0] = x < width - 1 && shapeMask[idx + 1] ? idx + 1 : -1;
    // West neighbor
    neighborIndices[i * 4 + 1] = x > 0 && shapeMask[idx - 1] ? idx - 1 : -1;
    // North neighbor
    neighborIndices[i * 4 + 2] = y > 0 && shapeMask[idx - width] ? idx - width : -1;
    // South neighbor
    neighborIndices[i * 4 + 3] = y < height - 1 && shapeMask[idx + width] ? idx + width : -1;
  }

  return {
    interiorPixels,
    boundaryPixels,
    pixelCount,
    neighborIndices,
  };
}

function solvePoissonSparse(
  sparseData: SparsePixelData,
  shapeMask: Uint8Array,
  boundaryMask: Uint8Array,
  width: number,
  height: number
): Float32Array {
  // This controls how smooth the falloff roundness will be and extend into the shape
  const ITERATIONS = POISSON_CONFIG_OPTIMIZED.iterations;

  // Keep C constant - only iterations control roundness spread
  const C = 0.01;

  const u = new Float32Array(width * height);
  const { interiorPixels, neighborIndices, pixelCount } = sparseData;

  // Performance tracking
  const startTime = performance.now();

  // Red-Black SOR for better symmetry with fewer iterations
  // omega between 1.8-1.95 typically gives best convergence for Poisson
  const omega = 1.9;

  // Pre-classify pixels as red or black for efficient processing
  const redPixels: number[] = [];
  const blackPixels: number[] = [];

  for (let i = 0; i < pixelCount; i++) {
    const idx = interiorPixels[i]!;
    const x = idx % width;
    const y = Math.floor(idx / width);

    if ((x + y) % 2 === 0) {
      redPixels.push(i);
    } else {
      blackPixels.push(i);
    }
  }

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // Red pass: update red pixels
    for (const i of redPixels) {
      const idx = interiorPixels[i]!;

      // Get precomputed neighbor indices
      const eastIdx = neighborIndices[i * 4 + 0]!;
      const westIdx = neighborIndices[i * 4 + 1]!;
      const northIdx = neighborIndices[i * 4 + 2]!;
      const southIdx = neighborIndices[i * 4 + 3]!;

      // Sum neighbors (use 0 for out-of-bounds)
      let sumN = 0;
      if (eastIdx >= 0) sumN += u[eastIdx]!;
      if (westIdx >= 0) sumN += u[westIdx]!;
      if (northIdx >= 0) sumN += u[northIdx]!;
      if (southIdx >= 0) sumN += u[southIdx]!;

      // SOR update: blend new value with old value
      const newValue = (C + sumN) / 4;
      u[idx] = omega * newValue + (1 - omega) * u[idx]!;
    }

    // Black pass: update black pixels
    for (const i of blackPixels) {
      const idx = interiorPixels[i]!;

      // Get precomputed neighbor indices
      const eastIdx = neighborIndices[i * 4 + 0]!;
      const westIdx = neighborIndices[i * 4 + 1]!;
      const northIdx = neighborIndices[i * 4 + 2]!;
      const southIdx = neighborIndices[i * 4 + 3]!;

      // Sum neighbors (use 0 for out-of-bounds)
      let sumN = 0;
      if (eastIdx >= 0) sumN += u[eastIdx]!;
      if (westIdx >= 0) sumN += u[westIdx]!;
      if (northIdx >= 0) sumN += u[northIdx]!;
      if (southIdx >= 0) sumN += u[southIdx]!;

      // SOR update: blend new value with old value
      const newValue = (C + sumN) / 4;
      u[idx] = omega * newValue + (1 - omega) * u[idx]!;
    }
  }

  if (POISSON_CONFIG_OPTIMIZED.measurePerformance) {
    const elapsed = performance.now() - startTime;

    console.log(`[Optimized Poisson Solver (SOR ω=${omega})]`);
    console.log(`  Working size: ${width}×${height}`);
    console.log(`  Iterations: ${ITERATIONS}`);
    console.log(`  Time: ${elapsed.toFixed(2)}ms`);
    console.log(`  Interior pixels processed: ${pixelCount}`);
    console.log(`  Speed: ${((ITERATIONS * pixelCount) / (elapsed * 1000)).toFixed(2)} Mpixels/sec`);
  }

  return u;
}

export interface BlobsLogoUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorInner: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_image: HTMLImageElement | string | undefined;
  u_contour: number;
  u_size: number;
}

export interface BlobsLogoParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  colorBack?: string;
  colorInner?: string;
  image?: HTMLImageElement | string | undefined;
  contour?: number;
  size?: number;
}
