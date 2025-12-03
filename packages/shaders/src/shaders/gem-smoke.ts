import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { declarePI, rotation2 } from '../shader-utils.js';

export const gemSmokeMeta = {
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
export const gemSmokeFragmentShader: string = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colors[${gemSmokeMeta.maxColorCount}];
uniform float u_colorsCount;
uniform vec4 u_colorBack;
uniform float u_distortion;
uniform float u_outerVisibility;
uniform float u_innerFill;
uniform float u_outerDistortion;
uniform float u_angle;
uniform float u_size;

${sizingVariablesDeclaration}

out vec4 fragColor;

${declarePI}
${rotation2}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge5x5(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius) {
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
    b * texture(tex, uv + vec2(0.)).r +
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

void main() {

  float t = u_time;

  vec2 imageUV = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, imageUV, dudx, dudy);

  float frame = getImgFrame(v_imageUV, 0.);

  float blurredEdge = blurEdge5x5(u_image, imageUV, dudx, dudy, 10.);
  float edge = 1. - blurredEdge;
  float thinEdge = u_distortion * pow(blurredEdge, 4.);
  float imgAlpha = img.g;
  imgAlpha *= frame;
  float smoothOuter = min(1., (1. - imgAlpha) + thinEdge);

  vec2 smokeUV = v_objectUV;
  float angle = u_angle * PI / 180.;
  smokeUV = rotate(smokeUV, angle);
  smokeUV *= mix(4., 1., u_size);

  float distortion = u_distortion;
  float swirl = mix(distortion * edge, mix(0., distortion, u_outerDistortion), smoothOuter);

  float midShift = distortion;
  smokeUV.y += midShift * (1. - sst(0., 1., length(.4 * smokeUV)));
  smokeUV.y -= .4 * midShift;

  for (int i = 1; i < 5; i++) {
    float iFloat = float(i);
    float stretch = max(length(dFdx(smokeUV)), length(dFdy(smokeUV)));
    float dampen = 1. / (1. + stretch * 8.);

    float s = swirl * dampen;
    smokeUV.x += s / iFloat * cos(t + iFloat * 2.5 * smokeUV.y);
    smokeUV.y += s / iFloat * cos(t + iFloat * 1.5 * smokeUV.x);
  }
  float shape = exp(-1.5 * dot(smokeUV, smokeUV));
  shape += mix(0., .15, u_innerFill) * imgAlpha * frame;

  float outerPower = pow(u_outerVisibility, 3.);
  shape *= (outerPower + (1. - outerPower) * (1. - smoothOuter));

  shape = pow(shape, .75);
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
  
  opacity -= thinEdge * imgAlpha;
  opacity = clamp(opacity, 0., 1.);

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

export interface GemSmokeUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colors: vec4[];
  u_colorsCount: number;
  u_image: HTMLImageElement | string | undefined;
  u_distortion: number;
  u_outerVisibility: number;
  u_innerFill: number;
  u_outerDistortion: number;
  u_angle: number;
  u_size: number;
}

export interface GemSmokeParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  colorBack?: string;
  image?: HTMLImageElement | string | undefined;
  distortion?: number;
  outerVisibility?: number;
  innerFill?: number;
  outerDistortion?: number;
  angle?: number;
  size?: number;
}
