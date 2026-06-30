import type { vec4 } from '../types.js';
import type { ShaderMotionParams } from '../shader-mount.js';
import type { ShaderSizingParams, ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, rotation2, declarePI } from '../shader-utils.js';

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
 * - u_innerDistortion (float): Power of smoke distortion inside the input shape (0 to 1)
 * - u_outerDistortion (float): Power of smoke distortion outside the input shape (0 to 1)
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

// language=WGSL
export const gemSmokeFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorsCount: f32,
  u_colorBack: vec4f,
  u_colorInner: vec4f,
  u_innerDistortion: f32,
  u_outerDistortion: f32,
  u_outerGlow: f32,
  u_innerGlow: f32,
  u_offset: f32,
  u_angle: f32,
  u_size: f32,
  u_shape: f32,
  u_isImage: f32,
  u_colors: array<vec4f, ${gemSmokeMeta.maxColorCount}>,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

@group(1) @binding(0) var u_image_tex: texture_2d<f32>;
@group(1) @binding(1) var u_image_samp: sampler;

${ declarePI }
${ rotation2 }

// 9x9 Gaussian blur on R and G channels
fn gaussBlur9x9RG(uv: vec2f, radius_in: f32) -> vec2f {
  let texel = 1.0 / vec2f(textureDimensions(u_image_tex, 0));
  let r = max(radius_in, 0.0) * texel;
  // Pascal's row 8: sum = 256, 2D norm = 65536
  let k = array<f32, 9>(1.0, 8.0, 28.0, 56.0, 70.0, 56.0, 28.0, 8.0, 1.0);
  var blur_sum = vec2f(0.0);

  for (var j: i32 = -4; j <= 4; j++) {
    let wy = k[j + 4];
    for (var i: i32 = -4; i <= 4; i++) {
      let w = k[i + 4] * wy;
      let off = vec2f(f32(i) * r.x, f32(j) * r.y);
      let s = textureSampleLevel(u_image_tex, u_image_samp, uv + off, 0.0);
      blur_sum += w * s.rg;
    }
  }

  return blur_sum / 65536.0;
}

fn sst(a: f32, b: f32, x: f32) -> f32 {
  return smoothstep(a, b, x);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {
  let time = u.u_time;

  var roundness: f32 = 0.0;
  var imgAlpha: f32 = 0.0;

  if (u.u_isImage > 0.5) {
    // Image sampling (UV scaled inward to account for padding)
    var imageUV = input.v_imageUV;
    imageUV -= vec2f(0.5);
    imageUV *= 0.95;
    imageUV += vec2f(0.5);

    // Blurred image: x = roundness, y = alpha
    let blurred = gaussBlur9x9RG(imageUV, 10.0);
    roundness = 1.0 - blurred.x;
    let texelA = 1.0 / vec2f(textureDimensions(u_image_tex, 0));
    let k3 = array<f32, 3>(1.0, 2.0, 1.0);
    for (var j: i32 = -1; j <= 1; j++) {
      for (var i: i32 = -1; i <= 1; i++) {
        imgAlpha += k3[i + 1] * k3[j + 1] * textureSampleLevel(u_image_tex, u_image_samp, imageUV + vec2f(f32(i) * texelA.x, f32(j) * texelA.y), 0.0).g;
      }
    }
    imgAlpha /= 16.0;
  } else {
    var uv = input.v_objectUV + vec2f(0.5);
    uv = vec2f(uv.x, 1.0 - uv.y);
    var edge: f32 = 0.0;

    if (u.u_shape < 1.0) {
      // full-fill on canvas
      let borderUV = input.v_responsiveUV + vec2f(0.5);
      let mask_val = min(borderUV, vec2f(1.0) - borderUV);
      let pixel_thickness = min(250.0 / input.v_responsiveBoxGivenSize, vec2f(0.5));
      var maskX = smoothstep(0.0, pixel_thickness.x, mask_val.x);
      var maskY = smoothstep(0.0, pixel_thickness.y, mask_val.y);
      maskX = pow(maskX, 0.25);
      maskY = pow(maskY, 0.25);
      edge = clamp(1.0 - maskX * maskY, 0.0, 1.0);
    } else if (u.u_shape < 2.0) {
      // circle
      var shapeUV = uv - vec2f(0.5);
      shapeUV *= 0.67;
      edge = pow(clamp(3.0 * length(shapeUV), 0.0, 1.0), 18.0);
    } else if (u.u_shape < 3.0) {
      // daisy
      var shapeUV = uv - vec2f(0.5);
      shapeUV *= 1.68;

      var r = length(shapeUV) * 2.0;
      let a = atan2(shapeUV.y, shapeUV.x) + 0.2;
      r *= (1.0 + 0.05 * sin(3.0 * a + 2.0 * time));
      let f = abs(cos(a * 3.0));
      edge = smoothstep(f, f + 0.7, r);
      edge *= edge;
    } else if (u.u_shape < 4.0) {
      // diamond
      var shapeUV = uv - vec2f(0.5);
      shapeUV = rotate(shapeUV, 0.25 * PI);
      shapeUV *= 1.42;
      shapeUV += vec2f(0.5);
      let mask_val = min(shapeUV, vec2f(1.0) - shapeUV);
      let pixel_thickness = vec2f(0.15);
      var maskX = smoothstep(0.0, pixel_thickness.x, mask_val.x);
      var maskY = smoothstep(0.0, pixel_thickness.y, mask_val.y);
      maskX = pow(maskX, 0.25);
      maskY = pow(maskY, 0.25);
      edge = clamp(1.0 - maskX * maskY, 0.0, 1.0);
    } else if (u.u_shape < 5.0) {
      // metaballs
      var shapeUV = uv - vec2f(0.5);
      shapeUV *= 1.3;
      edge = 0.0;
      for (var i: i32 = 0; i < 5; i++) {
        let fi = f32(i);
        let speed = 1.5 + 2.0 / 3.0 * sin(fi * 12.345);
        let mb_angle = -fi * 1.5;
        let dir1 = vec2f(cos(mb_angle), sin(mb_angle));
        let dir2 = vec2f(cos(mb_angle + 1.57), sin(mb_angle + 1.0));
        let traj = 0.4 * (dir1 * sin(time * speed + fi * 1.23) + dir2 * cos(time * (speed * 0.7) + fi * 2.17));
        let d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1.0 - smoothstep(0.65, 0.9, edge);
      edge = pow(edge, 4.0);
    }

    let fw_edge = abs(dpdx(edge)) + abs(dpdy(edge));
    imgAlpha = 1.0 - smoothstep(0.9 - 2.0 * fw_edge, 0.9, edge);
    roundness = 1.0 - edge;
  }

  // Smoke UV setup
  var smokeUV = input.v_objectUV;
  smokeUV = rotate(smokeUV, u.u_angle * PI / 180.0);
  smokeUV *= mix(4.0, 1.0, u.u_size);

  // Two swirl paths: inner (shape-masked) and outer (free), each with independent distortion
  var innerUV = smokeUV;
  var outerUV = smokeUV;

  // Vertical displacement — applied independently to inner and outer
  innerUV = vec2f(innerUV.x, innerUV.y + u.u_innerDistortion * (1.0 - sst(0.0, 1.0, length(0.4 * innerUV))));
  innerUV = vec2f(innerUV.x, innerUV.y - 0.4 * u.u_innerDistortion);
  innerUV = vec2f(innerUV.x, innerUV.y + 0.7 * u.u_offset * roundness);

  outerUV = vec2f(outerUV.x, outerUV.y + u.u_outerDistortion * (1.0 - sst(0.0, 1.0, length(0.4 * outerUV))));
  outerUV = vec2f(outerUV.x, outerUV.y - 0.4 * u.u_outerDistortion);

  let innerSwirl = u.u_innerDistortion * roundness;
  let outerSwirl = u.u_outerDistortion;

  for (var i: i32 = 1; i < 5; i++) {
    let fi = f32(i);

    let stretchIn = max(length(dpdx(innerUV)), length(dpdy(innerUV)));
    let dampenIn = 1.0 / (1.0 + stretchIn * 8.0);
    let sIn = innerSwirl * dampenIn;
    innerUV = vec2f(innerUV.x + sIn / fi * cos(time + fi * 2.9 * innerUV.y), innerUV.y);
    innerUV = vec2f(innerUV.x, innerUV.y + sIn / fi * cos(time + fi * 1.5 * innerUV.x));

    let stretchOut = max(length(dpdx(outerUV)), length(dpdy(outerUV)));
    let dampenOut = 1.0 / (1.0 + stretchOut * 8.0);
    let sOut = outerSwirl * dampenOut;
    outerUV = vec2f(outerUV.x + sOut / fi * cos(time + fi * 2.9 * outerUV.y), outerUV.y);
    outerUV = vec2f(outerUV.x, outerUV.y + sOut / fi * cos(time + fi * 1.5 * outerUV.x));
  }

  // Smoke shapes from swirl fields
  let innerShape_val = exp(-1.5 * dot(innerUV, innerUV));
  let outerShape_val = exp(-1.5 * dot(outerUV, outerUV));

  // Visibility masks
  let outerMask = pow(u.u_outerGlow, 2.0) * (1.0 - imgAlpha);
  let innerMask = (0.01 + 0.99 * u.u_innerGlow) * imgAlpha;

  var innerShape = innerShape_val * innerMask;
  var outerShape = outerShape_val * outerMask;

  // Color gradient
  let mixer = (innerShape + outerShape) * u.u_colorsCount;
  var gradient = u.u_colors[0];
  gradient = vec4f(gradient.rgb * gradient.a, gradient.a);

  var smokeMask: f32 = 0.0;
  for (var i: i32 = 1; i < ${gemSmokeMeta.maxColorCount + 1}; i++) {
    if (i > i32(u.u_colorsCount)) { break; }

    let m = sst(0.0, 1.0, clamp(mixer - f32(i - 1), 0.0, 1.0));
    if (i == 1) { smokeMask = m; }

    var c = u.u_colors[i - 1];
    c = vec4f(c.rgb * c.a, c.a);
    gradient = mix(gradient, c, m);
  }

  // Compositing (premultiplied alpha, front-to-back)
  var color = gradient.rgb * smokeMask;
  var opacity = gradient.a * smokeMask;

  let innerOpacity = u.u_colorInner.a * imgAlpha;
  let innerColor = u.u_colorInner.rgb * innerOpacity;
  color += innerColor * (1.0 - opacity);
  opacity += innerOpacity * (1.0 - opacity);

  let backColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color += backColor * (1.0 - opacity);
  opacity += u.u_colorBack.a * (1.0 - opacity);

  return vec4f(color, opacity);
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
      const imgW = width - 2 * padX;
      const imgH = height - 2 * padY;

      // ── 1. Shape canvas (working res): image centered with padding ──
      const shapeCanvas = document.createElement('canvas');
      shapeCanvas.width = width;
      shapeCanvas.height = height;

      const shapeCtx = shapeCanvas.getContext('2d')!;
      shapeCtx.drawImage(img, padX, padY, imgW, imgH);

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
      const origPadX = Math.ceil(originalWidth * paddingSize);
      const origPadY = Math.ceil(originalHeight * paddingSize);
      const originalCanvas = document.createElement('canvas');
      originalCanvas.width = originalWidth;
      originalCanvas.height = originalHeight;
      const originalCtx = originalCanvas.getContext('2d')!;
      originalCtx.drawImage(img, origPadX, origPadY, originalWidth - 2 * origPadX, originalHeight - 2 * origPadY);
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

  // Jacobi smoothing passes to remove Red-Black checkerboard artifacts
  const tmp = new Float32Array(width * height);
  for (let smooth = 0; smooth < 3; smooth++) {
    tmp.set(u);
    for (let i = 0; i < pixelCount; i++) {
      const idx = interiorPixels[i]!;
      const eastIdx = neighborIndices[i * 4 + 0]!;
      const westIdx = neighborIndices[i * 4 + 1]!;
      const northIdx = neighborIndices[i * 4 + 2]!;
      const southIdx = neighborIndices[i * 4 + 3]!;

      let sum = 0;
      let count = 0;
      if (eastIdx >= 0) { sum += tmp[eastIdx]!; count++; }
      if (westIdx >= 0) { sum += tmp[westIdx]!; count++; }
      if (northIdx >= 0) { sum += tmp[northIdx]!; count++; }
      if (southIdx >= 0) { sum += tmp[southIdx]!; count++; }

      u[idx] = count > 0 ? (tmp[idx]! + sum / count) * 0.5 : tmp[idx]!;
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
  u_innerDistortion: number;
  u_outerDistortion: number;
  u_outerGlow: number;
  u_innerGlow: number;
  u_colorInner: [number, number, number, number];
  u_offset: number;
  u_angle: number;
  u_size: number;
  u_shape: (typeof GemSmokeShapes)[GemSmokeShape];
  u_isImage: boolean;
}

export interface GemSmokeParams extends ShaderSizingParams, ShaderMotionParams {
  colors?: string[];
  colorBack?: string;
  image?: HTMLImageElement | string | undefined;
  innerDistortion?: number;
  outerDistortion?: number;
  outerGlow?: number;
  innerGlow?: number;
  colorInner?: string;
  offset?: number;
  angle?: number;
  size?: number;
  shape?: GemSmokeShape;
}

export const GemSmokeShapes = {
  none: 0,
  circle: 1,
  daisy: 2,
  diamond: 3,
  metaballs: 4,
} as const;

export type GemSmokeShape = keyof typeof GemSmokeShapes;
