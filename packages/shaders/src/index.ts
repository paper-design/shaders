/** The core Shader Mount class. Pass it a parent element and a fragment shader to get started. */
export { ShaderMount, isPaperShaderElement } from './shader-mount.js';
export type {
  PaperShaderElement,
  ShaderMotionParams,
  ShaderMountUniforms,
  ShaderPreset,
  ImageShaderPreset,
} from './shader-mount.js';

/** Shader sizing options and uniforms */
export {
  defaultObjectSizing,
  defaultPatternSizing,
  ShaderFitOptions,
  type ShaderFit,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from './shader-sizing.js';

/** A flowing interplay of color spots, moving along distinct trajectories and transformed by organic distortion */
export {
  meshGradientFragmentShader,
  meshGradientMeta,
  type MeshGradientParams,
  type MeshGradientUniforms,
} from './shaders/mesh-gradient.js';

/** Radial multi-colored gradient shaped with layered noise for a natural, smoky aesthetic */
export {
  smokeRingMeta,
  smokeRingFragmentShader,
  type SmokeRingParams,
  type SmokeRingUniforms,
} from './shaders/smoke-ring.js';

/** A glowing, web-like structure of fluid lines and soft intersections. Great for creating atmospheric, organic-yet-futuristic visuals */
export { neuroNoiseFragmentShader, type NeuroNoiseParams, type NeuroNoiseUniforms } from './shaders/neuro-noise.js';

/** Animated multi-color dots pattern with each dot orbiting around its cell center. Supports up to 40 colors and various shape and motion controls. Great for playful, dynamic backgrounds and UI textures */
export {
  dotOrbitMeta,
  dotOrbitFragmentShader,
  type DotOrbitParams,
  type DotOrbitUniforms,
} from './shaders/dot-orbit.js';

/** Static grid pattern made of circles, diamonds, squares or triangles */
export {
  dotGridFragmentShader,
  DotGridShapes,
  type DotGridShape,
  type DotGridParams,
  type DotGridUniforms,
} from './shaders/dot-grid.js';

/** A multi-color gradient mapped into smooth, animated curves, delivering a sleek, futuristic visual */
export {
  simplexNoiseMeta,
  simplexNoiseFragmentShader,
  type SimplexNoiseParams,
  type SimplexNoiseUniforms,
} from './shaders/simplex-noise.js';

/** Up to 20 gooey blobs moving around the center and merging into smooth organic shapes */
export {
  metaballsMeta,
  metaballsFragmentShader,
  type MetaballsParams,
  type MetaballsUniforms,
} from './shaders/metaballs.js';

/** Animated 3D Perlin noise with exposed controls */
export { perlinNoiseFragmentShader, type PerlinNoiseParams, type PerlinNoiseUniforms } from './shaders/perlin-noise.js';

/** Anti-aliased animated Voronoi pattern with smooth and customizable edges */
export { voronoiMeta, voronoiFragmentShader, type VoronoiParams, type VoronoiUniforms } from './shaders/voronoi.js';

/** Static line pattern configurable into textures ranging from sharp zigzags to smooth flowing waves */
export { wavesFragmentShader, type WavesParams, type WavesUniforms } from './shaders/waves.js';

/** Animated color fields warped by noise and swirls, applied over base patterns (checks, stripes, or split edge). Blends up to 10 colors with adjustable distribution, softness, distortion, and swirl. Great for fluid, smoky, or marbled effects */
export {
  warpMeta,
  warpFragmentShader,
  WarpPatterns,
  type WarpParams,
  type WarpUniforms,
  type WarpPattern,
} from './shaders/warp.js';

/** Animated rays of light radiating from the center, blended with up to 5 colors. The rays are adjustable by size, density, brightness and center glow. Great for dramatic backgrounds, logo reveals, and VFX like energy bursts or sun shafts */
export { godRaysMeta, godRaysFragmentShader, type GodRaysParams, type GodRaysUniforms } from './shaders/god-rays.js';

/** A single-colored animated spiral that morphs across a wide range of shapes - from crisp, thin-lined geometry to flowing whirlpool forms and wavy, abstract rings */
export { spiralFragmentShader, type SpiralParams, type SpiralUniforms } from './shaders/spiral.js';

/** Animated bands of color twisting and bending, producing spirals, arcs, and flowing circular patterns */
export { swirlMeta, swirlFragmentShader, type SwirlParams, type SwirlUniforms } from './shaders/swirl.js';

/** Animated 2-color dithering over with multiple pattern sources (noise, warp, dots, waves, ripple, swirl, sphere) */
export {
  ditheringFragmentShader,
  DitheringShapes,
  DitheringTypes,
  type DitheringParams,
  type DitheringUniforms,
  type DitheringShape,
  type DitheringType,
} from './shaders/dithering.js';

/** Multi-color gradients with grainy, noise-textured distortion available in 7 animated abstract forms */
export {
  grainGradientFragmentShader,
  grainGradientMeta,
  GrainGradientShapes,
  type GrainGradientParams,
  type GrainGradientUniforms,
  type GrainGradientShape,
} from './shaders/grain-gradient.js';

/** Luminous trails of color merging into a glowing gradient frame */
export {
  pulsingBorderMeta,
  pulsingBorderFragmentShader,
  PulsingBorderAspectRatios,
  type PulsingBorderParams,
  type PulsingBorderUniforms,
  type PulsingBorderAspectRatio,
} from './shaders/pulsing-border.js';

/** Glowing translucent 3D panels rotating around a central axis */
export {
  colorPanelsFragmentShader,
  colorPanelsMeta,
  type ColorPanelsParams,
  type ColorPanelsUniforms,
} from './shaders/color-panels.js';

/** Multi-point mesh gradients with up to 10 color spots, enhanced by two-direction warping, adjustable blend sharpness, and grain controls. Perfect for elegant wallpapers and atmospheric backdrops */
export {
  staticMeshGradientFragmentShader,
  staticMeshGradientMeta,
  type StaticMeshGradientParams,
  type StaticMeshGradientUniforms,
} from './shaders/static-mesh-gradient.js';

/** Radial gradient with up to 10 blended colors, featuring advanced focal point control, shape distortion, and grain effects */
export {
  staticRadialGradientFragmentShader,
  staticRadialGradientMeta,
  type StaticRadialGradientParams,
  type StaticRadialGradientUniforms,
} from './shaders/static-radial-gradient.js';

/** A static texture built from multiple noise layers, usable for a realistic paper and cardboard surfaces or generating abstract patterns. Can be used as a image filter or as a texture */
export {
  paperTextureFragmentShader,
  PaperTextureFoldTypes,
  type PaperTextureFoldType,
  type PaperTextureParams,
  type PaperTextureUniforms,
} from './shaders/paper-texture.js';

/** Water-like surface distortion with natural caustic realism. Works as an image filter or animated texture without image */
export { waterFragmentShader, type WaterParams, type WaterUniforms } from './shaders/water.js';

/** Fluted glass image filter transforms an image into streaked, ribbed distortions, giving a mix of clarity and obscurity */
export {
  flutedGlassFragmentShader,
  GlassDistortionShapes,
  GlassGridShapes,
  type GlassDistortionShape,
  type GlassGridShape,
  type FlutedGlassParams,
  type FlutedGlassUniforms,
} from './shaders/fluted-glass.js';

/** A dithering image filter with support for 4 dithering modes and multiple color palettes (2-color, 3-color, and multicolor options, using either predefined colors or ones sampled directly from the original image) */
export {
  imageDitheringFragmentShader,
  type ImageDitheringParams,
  type ImageDitheringUniforms,
} from './shaders/image-dithering.js';

/** A glowing gradient of colors flowing through an input image. The effect creates a smoothly animated wave of intensity across the image */
export {
  heatmapMeta,
  heatmapFragmentShader,
  toProcessedHeatmap,
  type HeatmapParams,
  type HeatmapUniforms,
} from './shaders/heatmap.js';

/** Futuristic liquid metal material applied to uploaded logo or one of pre-defined abstract shape */
export {
  liquidMetalFragmentShader,
  LiquidMetalShapes,
  toProcessedLiquidMetal,
  type LiquidMetalShape,
  type LiquidMetalParams,
  type LiquidMetalUniforms,
} from './shaders/liquid-metal.js';

/** A halftone-dot image filter featuring customizable grids, color palettes, and dot styles */
export {
  HalftoneDotsTypes,
  HalftoneDotsGrids,
  halftoneDotsFragmentShader,
  type HalftoneDotsParams,
  type HalftoneDotsUniforms,
  type HalftoneDotsType,
  type HalftoneDotsGrid,
} from './shaders/halftone-dots.js';

/** A halftone CMYK classic algo */
export {
  HalftoneCmykTypes,
  halftoneCmykFragmentShader,
  type HalftoneCmykParams,
  type HalftoneCmykUniforms,
  type HalftoneCmykType,
} from './shaders/halftone-cmyk.js';

// ----- Utils ----- //
export { getShaderColorFromString } from './get-shader-color-from-string.js';
export { getShaderNoiseTexture } from './get-shader-noise-texture.js';
export { getEmptyPixel } from './get-empty-pixel.js';
