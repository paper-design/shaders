import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import type { ShaderSizingParams, ShaderSizingUniforms } from '../shader-sizing.js';
import { rotation2, declarePI } from '../shader-utils.js';

export const gemSmokeMeta = {
  maxColorCount: 6,
} as const;

/**
 * Animated color fields placed over uploaded logo shape; gives the illusion of smoky noise
 * behind the glassy shape.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_image (sampler2D): Pre-processed source image texture (R = edge gradient, G = alpha)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colors (vec4[]): Up to 6 smoke colors in RGBA
 * - u_colorsCount (float): Number of active colors
 * - u_colorBack (vec4): Background color in RGBA
 * - u_distortion (float): Power of smoke distortion (0 to 1)
 * - u_outerDistortion (float): Power of distortion outside the input shape (0 to 1)
 * - u_outerGlow (float): Visibility of smoke shape outside the input shape (0 to 1)
 * - u_innerGlow (float): Visibility of smoke shape inside the input shape (0 to 1)
 * - u_colorInner (vec4): Additional color inside the input shape, mixing with smoke (RGBA)
 * - u_offset (float): Vertical offset of smoke inside the shape (-1 to 1)
 * - u_angle (float): Smoke direction in degrees (0 to 360)
 * - u_size (float): Size of smoke shape relative to the image box (0 to 1)
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): UV coordinates for sampling the source image, with fit, scale, rotation, and offset applied
 * - v_objectUV (vec2): Normalized UV coordinates with scale, rotation, and offset applied
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
export const gemSmokeFragmentShader: string = `#version 300 es
precision mediump float;

in mediump vec2 v_imageUV;
in mediump vec2 v_objectUV;
out vec4 fragColor;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colors[${gemSmokeMeta.maxColorCount}];
uniform float u_colorsCount;
uniform vec4 u_colorBack;
uniform float u_distortion;
uniform float u_outerGlow;
uniform float u_innerGlow;
uniform vec4 u_colorInner;
uniform float u_outerDistortion;
uniform float u_offset;
uniform float u_angle;
uniform float u_size;

${ declarePI }
${ rotation2 }

vec2 blurEdge5x5RG(
sampler2D tex,
vec2 uv,
vec2 dudx,
vec2 dudy,
float radius
) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = max(radius, 0.0) * texel;

  // Gaussian 1D kernel: [1, 4, 6, 4, 1]
  const float k[5] = float[5](1.0, 4.0, 6.0, 4.0, 1.0);

  float norm = 256.0;// (1+4+6+4+1)^2 = 16^2
  vec2 sum = vec2(0.0);// accumulate (R,G)

  // Loop over 5×5 grid: dy, dx ∈ [-2,2]
  for (int j = -2; j <= 2; ++j) {
    float wy = k[j + 2];

    for (int i = -2; i <= 2; ++i) {
      float wx = k[i + 2];
      float w = wx * wy;

      vec2 offset = vec2(float(i) * r.x, float(j) * r.y);
      vec4 t = texture(tex, uv + offset);

      // accumulate R and G separately
      sum += w * t.rg;
    }
  }

  return sum / norm;
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

void main() {

  float t = u_time;

  vec2 imageUV = v_imageUV;
  imageUV -= .5;
  imageUV *= .95;
  imageUV += .5;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, imageUV, dudx, dudy);
  
  float outer = 1. - img.b;
  outer = smoothstep(.5, .7, outer);
  vec2 blurredData = blurEdge5x5RG(u_image, imageUV, dudx, dudy, 5.);
  float edge = 1. - blurredData.x;
  float imgAlpha = blurredData.y;

  vec2 smokeUV = v_objectUV;
  float angle = u_angle * PI / 180.;
  smokeUV = rotate(smokeUV, angle);
  smokeUV *= mix(4., 1., u_size);

  float swirl = u_distortion * edge;
  swirl += mix(0., u_distortion, .66 * u_outerDistortion) * outer * (1. - imgAlpha);

  float midShift = u_distortion;
  smokeUV.y += midShift * (1. - sst(0., 1., length(.4 * smokeUV)));
  smokeUV.y -= .4 * midShift;
  smokeUV.y += .4 * u_offset * imgAlpha;

  for (int i = 1; i < 5; i++) {
    float iFloat = float(i);
    float stretch = max(length(dFdx(smokeUV)), length(dFdy(smokeUV)));
    float dampen = 1. / (1. + stretch * 8.);

    float s = swirl * dampen;
    smokeUV.x += s / iFloat * cos(t + iFloat * 2.9 * smokeUV.y);
    smokeUV.y += s / iFloat * cos(t + iFloat * 1.5 * smokeUV.x);
  }
  float shape = exp(-1.5 * dot(smokeUV, smokeUV));

  float outerPower = pow(u_outerGlow, 2.);
  float innerPower = .01 + .99 * u_innerGlow;
  shape *= mix(outerPower, innerPower, imgAlpha);

  shape = mix(shape, smoothstep(0., 1., shape), shape);
  float mixer = shape * u_colorsCount;
  vec4 gradient = u_colors[0];
  gradient.rgb *= gradient.a;

  float outerShape = 0.;
  for (int i = 1; i < ${gemSmokeMeta.maxColorCount + 1}; i++) {
    if (i > int(u_colorsCount)) break;

    float m = clamp(mixer - float(i - 1), 0., 1.);
    m = sst(0., 1., m);

    if (i == 1) {
      outerShape = m;
    }

    vec4 c = u_colors[i - 1];
    c.rgb *= c.a;
    gradient = mix(gradient, c, m);
  }

  vec3 color = gradient.rgb * outerShape;
  float opacity = gradient.a * outerShape;

  vec3 frontColor = u_colorInner.rgb * u_colorInner.a;
  float frontOpacity = u_colorInner.a * imgAlpha;
  color = color + frontColor * frontOpacity * (1.0 - opacity);
  opacity = opacity + frontOpacity * (1.0 - opacity);

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u_colorBack.a * (1.0 - opacity);

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

export function toProcessedGemSmoke(file: File | string): Promise<{ imageData: ImageData; pngBlob: Blob }> {
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

      const paddingSize = 0.025;
      const padX = Math.ceil(width * paddingSize);
      const padY = Math.ceil(height * paddingSize);
      const outerBlurRadius = Math.min(padX, padY);
      const imgW = width - 2 * padX;
      const imgH = height - 2 * padY;

      // ── 1. Shape canvas (working res): image centered with padding ──
      const shapeCanvas = document.createElement('canvas');
      shapeCanvas.width = width;
      shapeCanvas.height = height;
      const shapeCtx = shapeCanvas.getContext('2d')!;
      shapeCtx.drawImage(img, padX, padY, imgW, imgH);

      // ── 2. Build masks ──
      const startMask = performance.now();
      const shapeImageData = shapeCtx.getImageData(0, 0, width, height);
      const data = shapeImageData.data;

      const shapeMask = new Uint8Array(width * height);
      const boundaryMask = new Uint8Array(width * height);

      let shapePixelCount = 0;
      for (let i = 0, idx = 0; i < data.length; i += 4, idx++) {
        const a = data[i + 3];
        const isShape = a === 0 ? 0 : 1;
        shapeMask[idx] = isShape;
        shapePixelCount += isShape;
      }

      // ── 3. Boundary detection ──
      const boundaryIndices: number[] = [];
      const interiorIndices: number[] = [];

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          if (!shapeMask[idx]) continue;

          let isBoundary = false;
          if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
            isBoundary = true;
          } else {
            isBoundary =
              !shapeMask[idx - 1] ||
              !shapeMask[idx + 1] ||
              !shapeMask[idx - width] ||
              !shapeMask[idx + width] ||
              !shapeMask[idx - width - 1] ||
              !shapeMask[idx - width + 1] ||
              !shapeMask[idx + width - 1] ||
              !shapeMask[idx + width + 1];
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

      // ── 4. Poisson solve ──
      const sparseData = buildSparseData(
        shapeMask,
        boundaryMask,
        new Uint32Array(interiorIndices),
        new Uint32Array(boundaryIndices),
        width,
        height
      );

      const startSolve = performance.now();
      const u = solvePoissonSparse(sparseData, shapeMask, boundaryMask, width, height);

      if (POISSON_CONFIG_OPTIMIZED.measurePerformance) {
        console.log(`[Poisson Solve] Time: ${(performance.now() - startSolve).toFixed(2)}ms`);
      }

      let maxVal = 0;
      let finalImageData: ImageData;
      for (let i = 0; i < interiorIndices.length; i++) {
        const idx = interiorIndices[i]!;
        if (u[idx]! > maxVal) maxVal = u[idx]!;
      }

      // ── 5. Blur alpha (padding gives room so blur is never cropped) ──
      const alphaGray = new Uint8ClampedArray(width * height);
      for (let i = 0; i < shapeMask.length; i++) {
        alphaGray[i] = shapeMask[i]! * 255;
      }
      const blurredAlpha = multiPassBlurGray(alphaGray, width, height, outerBlurRadius, 3);

      // ── 6. Pack channels: R = roundness, G = alpha, B = blurred alpha, A = 255 ──
      const tempImg = shapeCtx.createImageData(width, height);
      for (let i = 0; i < width * height; i++) {
        const px = i * 4;

        if (!shapeMask[i]) {
          tempImg.data[px] = 255;
          tempImg.data[px + 1] = 0;
        } else {
          const poissonRatio = u[i]! / maxVal;
          tempImg.data[px] = 255 * (1 - poissonRatio);
          tempImg.data[px + 1] = 255;
        }

        tempImg.data[px + 2] = blurredAlpha[i]!;
        tempImg.data[px + 3] = 255;
      }
      shapeCtx.putImageData(tempImg, 0, 0);

      // ── 7. Upscale full padded canvas to original resolution ──
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(shapeCanvas, 0, 0, width, height, 0, 0, originalWidth, originalHeight);

      const outImg = ctx.getImageData(0, 0, originalWidth, originalHeight);

      // ── 8. Original-resolution alpha with matching padding ──
      const origPadX = Math.ceil(originalWidth * paddingSize);
      const origPadY = Math.ceil(originalHeight * paddingSize);
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = originalWidth;
      originalCanvas.height = originalHeight;
      const originalCtx = originalCanvas.getContext('2d')!;
      originalCtx.drawImage(img, origPadX, origPadY, originalWidth - 2 * origPadX, originalHeight - 2 * origPadY);
      const originalData = originalCtx.getImageData(0, 0, originalWidth, originalHeight);

      // ── 9. Final assembly: override G with sharp original alpha ──
      for (let i = 0; i < outImg.data.length; i += 4) {
        const a = originalData.data[i + 3]!;
        const upscaledAlpha = outImg.data[i + 1]!;
        if (a === 0) {
          outImg.data[i] = 255;
          outImg.data[i + 1] = 0;
        } else {
          outImg.data[i] = upscaledAlpha === 0 ? 0 : outImg.data[i]!;
          outImg.data[i + 1] = a;
        }
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

function blurGray(gray: Uint8ClampedArray, width: number, height: number, radius: number): Uint8ClampedArray {
  if (radius <= 0) {
    return gray.slice();
  }

  const out = new Uint8ClampedArray(width * height);
  const integral = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const v = gray[idx] ?? 0;
      rowSum += v;
      integral[idx] = rowSum + (y > 0 ? (integral[idx - width] ?? 0) : 0);
    }
  }

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

export interface GemSmokeUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_image: HTMLImageElement | string | undefined;
  u_distortion: number;
  u_outerGlow: number;
  u_innerGlow: number;
  u_colorInner: [number, number, number, number];
  u_outerDistortion: number;
  u_offset: number;
  u_angle: number;
  u_size: number;
}

export interface GemSmokeParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  colorBack?: string;
  image?: HTMLImageElement | string | undefined;
  distortion?: number;
  outerGlow?: number;
  innerGlow?: number;
  colorInner?: string;
  outerDistortion?: number;
  offset?: number;
  angle?: number;
  size?: number;
}
