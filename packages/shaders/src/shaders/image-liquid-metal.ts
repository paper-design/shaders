import type { ShaderMotionParams } from '../shader-mount.js';
import { sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';


// language=GLSL
export const imageLiquidMetalFragmentShader: string = `#version 300 es
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

    float diagonal = uv.x - uv.y;

    float t = .1 * u_time;

    vec4 img = texture(u_image, v_imageUV);

    vec3 color = vec3(0.);
    float opacity = img.a;

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

//    opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);
    opacity *= get_img_frame_alpha(v_imageUV, 0.);


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

// Configuration for Poisson solver
export const POISSON_CONFIG_OPTIMIZED = {
  measurePerformance: false, // Set to true to see performance metrics
  workingSize: 500, // Size to solve Poisson at (will upscale to original size)
  iterations: 60, // SOR converges ~2-20x faster than standard Gauss-Seidel
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

export function toProcessedImageLiquidMetal(file: File | string): Promise<{ imageData: ImageData; pngBlob: Blob }> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve, reject) => {
    if (!file || !ctx) {
      reject(new Error('Invalid file or canvas context'));
      return;
    }

    const img = new Image();
    const totalStartTime = performance.now();

    img.onload = () => {
      // Force SVG to load at a high fidelity size if it's an SVG
      const isSVG = typeof file === 'string' ? file.endsWith('.svg') : file.type === 'image/svg+xml';

      let originalWidth = img.width || img.naturalWidth;
      let originalHeight = img.height || img.naturalHeight;

      if (isSVG) {
        // Scale SVG to 1000px max dimension while preserving aspect ratio
        const svgMaxSize = 1000;
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
      const maxDimension = Math.max(originalWidth, originalHeight);
      const targetSize = POISSON_CONFIG_OPTIMIZED.workingSize;

      // Calculate scale to fit within workingSize
      const scaleFactor = targetSize / maxDimension;
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
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const idx4 = idx * 4;
          const r = data[idx4];
          const g = data[idx4 + 1];
          const b = data[idx4 + 2];
          const a = data[idx4 + 3];

          // Shape pixel: not pure white and not fully transparent
          if (!((r === 255 && g === 255 && b === 255 && a === 255) || a === 0)) {
            shapeMask[idx] = 1;
            shapePixelCount++;
          }
        }
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

      // Create gradient image at working resolution
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
            const gray = 255 * (1 - poissonRatio);
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
      // This ensures edges are pixel-perfect while gradient is smooth
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = originalWidth;
      originalCanvas.height = originalHeight;
      const originalCtx = originalCanvas.getContext('2d')!;
      originalCtx.drawImage(img, 0, 0, originalWidth, originalHeight);
      const originalData = originalCtx.getImageData(0, 0, originalWidth, originalHeight);

      // Process each pixel: Red channel = gradient, Alpha channel = original alpha
      for (let i = 0; i < outImg.data.length; i += 4) {
        const r = originalData.data[i]!;
        const g = originalData.data[i + 1]!;
        const b = originalData.data[i + 2]!;
        const a = originalData.data[i + 3]!;

        if (a === 0) {
          // Fully transparent - white background
          outImg.data[i] = 255; // R: white (no gradient)
          outImg.data[i + 1] = 255; // G: white
          outImg.data[i + 2] = 255; // B: white
          outImg.data[i + 3] = 0; // A: transparent
        } else if (r === 255 && g === 255 && b === 255 && a === 255) {
          // Pure white with full opacity - background
          outImg.data[i] = 255; // R: white (no gradient)
          outImg.data[i + 1] = 255; // G: white
          outImg.data[i + 2] = 255; // B: white
          outImg.data[i + 3] = 0; // A: transparent (marks as background for shader)
        } else {
          // Part of the shape (including anti-aliased edges)
          const upscaledAlpha = outImg.data[i + 3]!; // Alpha from upscaled image
          const currentGray = outImg.data[i]!; // Current gradient value from upscale

          // Check if upscale missed this pixel by looking at alpha channel
          // If upscaled alpha is 0, the low-res version thought this was background
          const gradientValue: number = upscaledAlpha === 0 ? 0 : currentGray;

          // Red channel carries the gradient
          outImg.data[i] = gradientValue;
          // Green and Blue match for grayscale (shader might use these too)
          outImg.data[i + 1] = gradientValue;
          outImg.data[i + 2] = gradientValue;
          // Alpha channel preserves original alpha for anti-aliasing
          outImg.data[i + 3] = a;
        }
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
  // This controls how smooth the falloff gradient will be and extend into the shape
  const ITERATIONS = POISSON_CONFIG_OPTIMIZED.iterations;

  // Keep C constant - only iterations control gradient spread
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

export interface ImageLiquidMetalUniforms extends ShaderSizingUniforms {
  u_image: HTMLImageElement | string | undefined;
  u_patternScale: number;
  u_refraction: number;
  u_edge: number;
  u_patternBlur: number;
  u_liquid: number;
}

export interface ImageLiquidMetalParams extends ShaderSizingParams, ShaderMotionParams {
  image?: HTMLImageElement | string | undefined;
  patternScale?: number;
  refraction?: number;
  edge?: number;
  patternBlur?: number;
  liquid?: number;
}
