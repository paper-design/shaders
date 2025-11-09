import type {ShaderMotionParams} from '../shader-mount.js';
import {sizingVariablesDeclaration, type ShaderSizingParams, type ShaderSizingUniforms} from '../shader-sizing.js';
import {declarePI, rotation2, simplexNoise, colorBandingFix} from '../shader-utils.js';

/**
 *
 * Fluid motion imitation applied over user image
 * (animated stripe pattern getting distorted with shape edges)
 *
 * Uniforms:
 * - u_colorBack, u_colorFront (RGBA)
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
export const foldsFragmentShader: string = `#version 300 es
precision mediump float;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorFront;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;

uniform float u_shape;
uniform bool u_isImage;

${ sizingVariablesDeclaration }

out vec4 fragColor;

${ declarePI }
${ rotation2 }
${ simplexNoise }

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
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
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorFront.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float edge = 0.;

  float edgeRaw = img.r;
  edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);

  vec3 color = vec3(0.);

  float opacity = 1.;

  float alpha = 0.;
  alpha = img.g;
  float frame = getImgFrame(v_imageUV, 0.);
  alpha *= frame;
  
  vec2 p = uv * 30.;

  float test = .9;
  
  float wave = 2. * (.7 * cos(.3 * p.x + .1 * p.y + u_time) - 0.6 * sin(.6 * p.y + u_time));
  float addon = mix((1. - edge) * wave, 0., pow(edge, 8.));
  p.y -= addon;

  vec2 d = abs(fract(p) - .5);
  vec2 aa = 2. * fwidth(p);
  float w = .2 * (1. - edge);

  vec2 gx = 1.0 - smoothstep(vec2(w) +vec2(0.), vec2(w) + aa, d);
  float grid = gx.y;

  color = mix(u_colorBack.rgb, u_colorFront.rgb, grid);

  fragColor = vec4(color, 1.);

}
`;

// Configuration for Poisson solver
export const POISSON_CONFIG_OPTIMIZED = {
    measurePerformance: false, // Set to true to see performance metrics
    workingSize: 512, // Size to solve Poisson at (will upscale to original size)
    iterations: 40, // SOR converges ~2-20x faster than standard Gauss-Seidel
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

export function toProcessedFolds(file: File | string): Promise<{ imageData: ImageData; pngBlob: Blob }> {
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
                console.log(`  Original: ${ originalWidth }×${ originalHeight }`);
                console.log(`  Working: ${ width }×${ height } (${ (scaleFactor * 100).toFixed(1) }% scale)`);
                if (scaleFactor < 1) {
                    console.log(`  Speedup: ~${ Math.round(1 / (scaleFactor * scaleFactor)) }×`);
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
                console.log(`[Mask Building] Time: ${ (performance.now() - startMask).toFixed(2) }ms`);
                console.log(
                    `  Shape pixels: ${ shapePixelCount } / ${ width * height } (${ ((shapePixelCount / (width * height)) * 100).toFixed(1) }%)`
                );
                console.log(`  Interior pixels: ${ interiorIndices.length }`);
                console.log(`  Boundary pixels: ${ boundaryIndices.length }`);
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
                console.log(`[Poisson Solve] Time: ${ (performance.now() - startSolve).toFixed(2) }ms`);
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
            // originalCtx.fillStyle = "white";
            // originalCtx.fillRect(0, 0, originalWidth, originalHeight);
            originalCtx.drawImage(img, 0, 0, originalWidth, originalHeight);
            const originalData = originalCtx.getImageData(0, 0, originalWidth, originalHeight);

            // Process each pixel: Red channel = gradient, Alpha channel = original alpha
            for (let i = 0; i < outImg.data.length; i += 4) {
                const a = originalData.data[i + 3]!;
                // Use only alpha to determine background vs shape
                const upscaledAlpha = outImg.data[i + 3]!;
                if (a === 0) {
                    // Background pixel
                    outImg.data[i] = 255;
                    outImg.data[i + 1] = 0;
                } else {
                    // Red channel carries the gradient
                    // Check if upscale missed this pixel by looking at alpha channel
                    // If upscaled alpha is 0, the low-res version thought this was background
                    outImg.data[i] = upscaledAlpha === 0 ? 0 : outImg.data[i]!; // gradient or 0
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
                    console.log(`[Total Processing Time] ${ totalTime.toFixed(2) }ms`);
                    if (scaleFactor < 1) {
                        const estimatedFullResTime = totalTime * Math.pow((originalWidth * originalHeight) / (width * height), 1.5);
                        console.log(`[Estimated time at full resolution] ~${ estimatedFullResTime.toFixed(0) }ms`);
                        console.log(
                            `[Time saved] ~${ (estimatedFullResTime - totalTime).toFixed(0) }ms (${ Math.round(estimatedFullResTime / totalTime) }× faster)`
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
    const {interiorPixels, neighborIndices, pixelCount} = sparseData;

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

        console.log(`[Optimized Poisson Solver (SOR ω=${ omega })]`);
        console.log(`  Working size: ${ width }×${ height }`);
        console.log(`  Iterations: ${ ITERATIONS }`);
        console.log(`  Time: ${ elapsed.toFixed(2) }ms`);
        console.log(`  Interior pixels processed: ${ pixelCount }`);
        console.log(`  Speed: ${ ((ITERATIONS * pixelCount) / (elapsed * 1000)).toFixed(2) } Mpixels/sec`);
    }

    return u;
}

export interface FoldsUniforms extends ShaderSizingUniforms {
    u_colorBack: [number, number, number, number];
    u_colorFront: [number, number, number, number];
    u_image: HTMLImageElement | string | undefined;
    u_repetition: number;
    u_shiftRed: number;
    u_shiftBlue: number;
    u_contour: number;
    u_softness: number;
    u_distortion: number;
    u_angle: number;
    u_shape: (typeof FoldsShapes)[FoldsShape];
    u_isImage: boolean;
}

export interface FoldsParams extends ShaderSizingParams, ShaderMotionParams {
    colorBack?: string;
    colorFront?: string;
    image?: HTMLImageElement | string | undefined;
    repetition?: number;
    shiftRed?: number;
    shiftBlue?: number;
    contour?: number;
    softness?: number;
    distortion?: number;
    angle?: number;
    shape?: FoldsShape;
}

export const FoldsShapes = {
    none: 0,
    circle: 1,
    daisy: 2,
    diamond: 3,
    metaballs: 4,
} as const;

export type FoldsShape = keyof typeof FoldsShapes;
