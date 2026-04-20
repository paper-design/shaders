import type { ShaderMotionParams } from '../shader-mount.js';
import { type ShaderSizingParams, type ShaderSizingUniforms } from '../shader-sizing.js';
import { systemUniformFields, vertexOutputStruct, declarePI, rotation2, glslMod, simplexNoise, colorBandingFix } from '../shader-utils.js';

/**
 * Futuristic liquid metal material applied to uploaded logo or abstract shape.
 * Fluid motion imitation applied over user image with animated stripe pattern
 * getting distorted along shape edges.
 *
 * Fragment shader uniforms:
 * - u_time (float): Animation time
 * - u_resolution (vec2): Canvas resolution in pixels
 * - u_image (sampler2D): Pre-processed source image texture (R = edge gradient, G = opacity)
 * - u_imageAspectRatio (float): Aspect ratio of the source image
 * - u_colorBack (vec4): Background color in RGBA
 * - u_colorTint (vec4): Overlay color in RGBA (color burn blending used)
 * - u_repetition (float): Density of pattern stripes (1 to 10)
 * - u_softness (float): Color transition sharpness, 0 = hard edge, 1 = smooth gradient (0 to 1)
 * - u_shiftRed (float): R-channel dispersion (-1 to 1)
 * - u_shiftBlue (float): B-channel dispersion (-1 to 1)
 * - u_distortion (float): Noise distortion over the stripes pattern (0 to 1)
 * - u_contour (float): Strength of the distortion on the shape edges (0 to 1)
 * - u_angle (float): Direction of pattern animation in degrees (0 to 360)
 * - u_shape (float): Predefined shape when no image provided (0 = none, 1 = circle, 2 = daisy, 3 = diamond, 4 = metaballs)
 * - u_isImage (bool): Whether an image is being used as the effect mask
 *
 * Vertex shader outputs (used in fragment shader):
 * - v_imageUV (vec2): UV coordinates for sampling the source image, with fit, scale, rotation, and offset applied
 * - v_objectUV (vec2): Object box UV coordinates with global sizing (scale, rotation, offsets, etc) applied (used when no image)
 * - v_responsiveUV (vec2): Responsive UV coordinates that adapt to canvas aspect ratio (used for canvas-fill mode)
 * - v_responsiveBoxGivenSize (vec2): TBD
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

export const liquidMetalFragmentShader: string = `
struct Uniforms {
  ${systemUniformFields}
  u_colorBack: vec4f,
  u_colorTint: vec4f,
  u_softness: f32,
  u_repetition: f32,
  u_shiftRed: f32,
  u_shiftBlue: f32,
  u_distortion: f32,
  u_contour: f32,
  u_angle: f32,
  u_shape: f32,
  u_isImage: f32,
}
@group(0) @binding(0) var<uniform> u: Uniforms;

${vertexOutputStruct}

@group(1) @binding(0) var u_image_tex: texture_2d<f32>;
@group(1) @binding(1) var u_image_samp: sampler;

${ declarePI }
${ rotation2 }
${ glslMod }
${ simplexNoise }

fn getColorChanges(c1: f32, c2: f32, stripe_p: f32, w: vec3f, blur: f32, bump_in: f32, tint: f32) -> f32 {

  var ch = mix(c2, c1, smoothstep(0.0, 2.0 * blur, stripe_p));

  var border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe_p));

  var bump = bump_in;
  if (u.u_isImage > 0.5) {
    bump = smoothstep(0.2, 0.8, bump);
  }
  border = w[0] + 0.4 * (1.0 - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe_p));

  border = w[0] + 0.5 * (1.0 - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2.0 * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2.0 * blur, stripe_p));

  let gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  let gradient_val = mix(c1, c2, smoothstep(0.0, 1.0, gradient_t));
  ch = mix(ch, gradient_val, smoothstep(border, border + 0.5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1.0 - min(1.0, (1.0 - ch) / max(tint, 0.0001)), u.u_colorTint.a);
  return ch;
}

fn getImgFrame(uv: vec2f, th: f32) -> f32 {
  var frame: f32 = 1.0;
  frame *= smoothstep(0.0, th, uv.y);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.y);
  frame *= smoothstep(0.0, th, uv.x);
  frame *= 1.0 - smoothstep(1.0 - th, 1.0, uv.x);
  return frame;
}

fn blurEdge3x3(uv: vec2f, dudx_v: vec2f, dudy_v: vec2f, radius: f32, centerSample: f32) -> f32 {
  let texel = 1.0 / vec2f(textureDimensions(u_image_tex, 0));
  let r = radius * texel;

  let w1: f32 = 1.0;
  let w2: f32 = 2.0;
  let w4: f32 = 4.0;
  let norm: f32 = 16.0;
  var blur_sum = w4 * centerSample;

  blur_sum += w2 * textureSampleGrad(u_image_tex, u_image_samp, uv + vec2f(0.0, -r.y), dudx_v, dudy_v).r;
  blur_sum += w2 * textureSampleGrad(u_image_tex, u_image_samp, uv + vec2f(0.0, r.y), dudx_v, dudy_v).r;
  blur_sum += w2 * textureSampleGrad(u_image_tex, u_image_samp, uv + vec2f(-r.x, 0.0), dudx_v, dudy_v).r;
  blur_sum += w2 * textureSampleGrad(u_image_tex, u_image_samp, uv + vec2f(r.x, 0.0), dudx_v, dudy_v).r;

  blur_sum += w1 * textureSampleGrad(u_image_tex, u_image_samp, uv + vec2f(-r.x, -r.y), dudx_v, dudy_v).r;
  blur_sum += w1 * textureSampleGrad(u_image_tex, u_image_samp, uv + vec2f(r.x, -r.y), dudx_v, dudy_v).r;
  blur_sum += w1 * textureSampleGrad(u_image_tex, u_image_samp, uv + vec2f(-r.x, r.y), dudx_v, dudy_v).r;
  blur_sum += w1 * textureSampleGrad(u_image_tex, u_image_samp, uv + vec2f(r.x, r.y), dudx_v, dudy_v).r;

  return blur_sum / norm;
}

fn lst(edge0: f32, edge1: f32, x: f32) -> f32 {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

@fragment fn fs_main(input: VertexOutput) -> @location(0) vec4f {

  let firstFrameOffset: f32 = 2.8;
  var t = 0.3 * (u.u_time + firstFrameOffset);

  var uv = input.v_imageUV;
  let dudx_v = dpdx(input.v_imageUV);
  let dudy_v = dpdy(input.v_imageUV);
  let img = textureSampleGrad(u_image_tex, u_image_samp, uv, dudx_v, dudy_v);

  if (u.u_isImage < 0.5) {
    uv = input.v_objectUV + vec2f(0.5);
    uv = vec2f(uv.x, 1.0 - uv.y);
  }

  var cycleWidth = u.u_repetition;
  var edge: f32 = 0.0;
  var contOffset: f32 = 1.0;

  var rotatedUV = uv - vec2f(0.5);
  let rot_angle = (-u.u_angle + 70.0) * PI / 180.0;
  let cosA = cos(rot_angle);
  let sinA = sin(rot_angle);
  rotatedUV = vec2f(
    rotatedUV.x * cosA - rotatedUV.y * sinA,
    rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2f(0.5);

  if (u.u_isImage > 0.5) {
    let edgeRaw = img.r;
    edge = blurEdge3x3(uv, dudx_v, dudy_v, 6.0, edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u.u_contour));
  } else {
    if (u.u_shape < 1.0) {
      // full-fill on canvas
      let borderUV = input.v_responsiveUV + vec2f(0.5);
      let ratio = input.v_responsiveBoxGivenSize.x / input.v_responsiveBoxGivenSize.y;
      let mask_val = min(borderUV, vec2f(1.0) - borderUV);
      let pixel_thickness = min(250.0 / input.v_responsiveBoxGivenSize, vec2f(0.5));
      var maskX = smoothstep(0.0, pixel_thickness.x, mask_val.x);
      var maskY = smoothstep(0.0, pixel_thickness.y, mask_val.y);
      maskX = pow(maskX, 0.25);
      maskY = pow(maskY, 0.25);
      edge = clamp(1.0 - maskX * maskY, 0.0, 1.0);

      uv = input.v_responsiveUV;
      if (ratio > 1.0) {
        uv = vec2f(uv.x, uv.y / ratio);
      } else {
        uv = vec2f(uv.x * ratio, uv.y);
      }
      uv += vec2f(0.5);
      uv = vec2f(uv.x, 1.0 - uv.y);

      cycleWidth *= 2.0;
      contOffset = 1.5;

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
      r *= (1.0 + 0.05 * sin(3.0 * a + 2.0 * t));
      let f = abs(cos(a * 3.0));
      edge = smoothstep(f, f + 0.7, r);
      edge *= edge;

      uv *= 0.8;
      cycleWidth *= 1.6;

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
        let traj = 0.4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        let d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1.0 - smoothstep(0.65, 0.9, edge);
      edge = pow(edge, 4.0);
    }

    let fw_edge = abs(dpdx(edge)) + abs(dpdy(edge));
    edge = mix(smoothstep(0.9 - 2.0 * fw_edge, 0.9, edge), edge, smoothstep(0.0, 0.4, u.u_contour));

  }

  var opacity: f32 = 0.0;
  if (u.u_isImage > 0.5) {
    opacity = img.g;
    let frame = getImgFrame(input.v_imageUV, 0.0);
    opacity *= frame;
  } else {
    let fw_edge2 = abs(dpdx(edge)) + abs(dpdy(edge));
    opacity = 1.0 - smoothstep(0.9 - 2.0 * fw_edge2, 0.9, edge);
    if (u.u_shape < 2.0) {
      edge = 1.2 * edge;
    } else if (u.u_shape < 5.0) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  let diagBLtoTR = rotatedUV.x - rotatedUV.y;
  let diagTLtoBR = rotatedUV.x + rotatedUV.y;

  var color = vec3f(0.0);
  let color1 = vec3f(0.98, 0.98, 1.0);
  let color2 = vec3f(0.1, 0.1, 0.1 + 0.1 * smoothstep(0.7, 1.3, diagTLtoBR));

  var grad_uv = uv - vec2f(0.5);

  let dist = length(grad_uv + vec2f(0.0, 0.2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (0.25 - 0.2 * diagBLtoTR) * PI);
  var direction = grad_uv.x;

  var bump = pow(1.8 * dist, 1.2);
  bump = 1.0 - bump;
  bump *= pow(uv.y, 0.3);


  let thin_strip_1_ratio = 0.12 / cycleWidth * (1.0 - 0.4 * bump);
  let thin_strip_2_ratio = 0.07 / cycleWidth * (1.0 + 0.4 * bump);
  let wide_strip_ratio = (1.0 - thin_strip_1_ratio - thin_strip_2_ratio);

  let thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  let thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  let noise = snoise(uv - vec2f(t));

  edge += (1.0 - edge) * u.u_distortion * noise;

  direction += diagBLtoTR;
  var contour: f32 = 0.0;
  direction -= 2.0 * noise * diagBLtoTR * (smoothstep(0.0, 1.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge)));
  direction *= mix(1.0, 1.0 - edge, smoothstep(0.5, 1.0, u.u_contour));
  direction -= 1.7 * edge * smoothstep(0.5, 1.0, u.u_contour);
  direction += 0.2 * pow(u.u_contour, 4.0) * (1.0 - smoothstep(0.0, 1.0, edge));

  bump *= clamp(pow(uv.y, 0.1), 0.3, 1.0);
  direction *= (0.1 + (1.1 - edge) * bump);

  direction *= (0.4 + 0.6 * (1.0 - smoothstep(0.5, 1.0, edge)));
  direction += 0.18 * (smoothstep(0.1, 0.2, uv.y) * (1.0 - smoothstep(0.2, 0.4, uv.y)));
  direction += 0.03 * (smoothstep(0.1, 0.2, 1.0 - uv.y) * (1.0 - smoothstep(0.2, 0.4, 1.0 - uv.y)));

  direction *= (0.5 + 0.5 * pow(uv.y, 2.0));
  direction *= cycleWidth;
  direction -= t;


  var colorDispersion = (1.0 - bump);
  colorDispersion = clamp(colorDispersion, 0.0, 1.0);
  var dispersionRed = colorDispersion;
  dispersionRed += 0.03 * bump * noise;
  dispersionRed += 5.0 * (smoothstep(-0.1, 0.2, uv.y) * (1.0 - smoothstep(0.1, 0.5, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 1.0, bump)));
  dispersionRed -= diagBLtoTR;

  var dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0.0, 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.8, uv.y))) * (smoothstep(0.4, 0.6, bump) * (1.0 - smoothstep(0.4, 0.8, bump)));
  dispersionBlue -= 0.2 * edge;

  dispersionRed *= (u.u_shiftRed / 20.0);
  dispersionBlue *= (u.u_shiftBlue / 20.0);

  var blur: f32 = 0.0;
  var rExtraBlur: f32 = 0.0;
  var gExtraBlur: f32 = 0.0;
  if (u.u_isImage > 0.5) {
    let softness = 0.05 * u.u_softness;
    blur = softness + 0.5 * smoothstep(1.0, 10.0, u.u_repetition) * smoothstep(0.0, 1.0, edge);
    let smallCanvasT = 1.0 - smoothstep(100.0, 500.0, min(u.u_resolution.x, u.u_resolution.y));
    blur += smallCanvasT * smoothstep(0.0, 1.0, edge);
    rExtraBlur = softness * (0.05 + 0.1 * (u.u_shiftRed / 20.0) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1.0 - diagBLtoTR));
  } else {
    blur = u.u_softness / 15.0 + 0.3 * contour;
  }

  var w = vec3f(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w = vec3f(w.x, w.y - 0.02 * smoothstep(0.0, 1.0, edge + bump), w.z);
  let stripe_r = fract(direction + dispersionRed);
  let fw_stripe_r = abs(dpdx(stripe_r)) + abs(dpdy(stripe_r));
  let r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fw_stripe_r + rExtraBlur, bump, u.u_colorTint.r);
  let stripe_g = fract(direction);
  let fw_stripe_g = abs(dpdx(stripe_g)) + abs(dpdy(stripe_g));
  let g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fw_stripe_g + gExtraBlur, bump, u.u_colorTint.g);
  let stripe_b = fract(direction - dispersionBlue);
  let fw_stripe_b = abs(dpdx(stripe_b)) + abs(dpdy(stripe_b));
  let b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fw_stripe_b, bump, u.u_colorTint.b);

  color = vec3f(r, g, b);
  color *= opacity;

  let bgColor = u.u_colorBack.rgb * u.u_colorBack.a;
  color = color + bgColor * (1.0 - opacity);
  opacity = opacity + u.u_colorBack.a * (1.0 - opacity);

  ${ colorBandingFix }

  return vec4f(color, opacity);
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

export function toProcessedLiquidMetal(file: File | string): Promise<{ imageData: ImageData; pngBlob: Blob }> {
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

export interface LiquidMetalUniforms extends ShaderSizingUniforms {
  u_colorBack: [number, number, number, number];
  u_colorTint: [number, number, number, number];
  u_image: HTMLImageElement | string | undefined;
  u_repetition: number;
  u_shiftRed: number;
  u_shiftBlue: number;
  u_contour: number;
  u_softness: number;
  u_distortion: number;
  u_angle: number;
  u_shape: (typeof LiquidMetalShapes)[LiquidMetalShape];
  u_isImage: boolean;
}

export interface LiquidMetalParams extends ShaderSizingParams, ShaderMotionParams {
  colorBack?: string;
  colorTint?: string;
  image?: HTMLImageElement | string | undefined;
  repetition?: number;
  shiftRed?: number;
  shiftBlue?: number;
  contour?: number;
  softness?: number;
  distortion?: number;
  angle?: number;
  shape?: LiquidMetalShape;
}

export const LiquidMetalShapes = {
  none: 0,
  circle: 1,
  daisy: 2,
  diamond: 3,
  metaballs: 4,
} as const;

export type LiquidMetalShape = keyof typeof LiquidMetalShapes;
