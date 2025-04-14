/** The core Shader Mount class. Pass it a parent element and a fragment shader to get started. */
export { ShaderMount, isPaperShaderElement } from './shader-mount';
export type { PaperShaderElement, ShaderMotionParams, ShaderMountUniforms, ShaderPreset } from './shader-mount';

/** Shader sizing options and uniforms */
export {
  defaultObjectSizing,
  defaultPatternSizing,
  ShaderFitOptions,
  type ShaderFit,
  type ShaderSizingParams,
  type ShaderSizingUniforms,
} from './shader-sizing';

// ----- Mesh gradient ----- //
/** A shader that renders a mesh gradient with a rotating noise pattern and several layers of fractal noise */
export {
  meshGradientFragmentShader,
  meshGradientMeta,
  type MeshGradientParams,
  type MeshGradientUniforms,
} from './shaders/mesh-gradient';

// ----- Smoke ring ----- //
/** Fractional Brownian motion (fBm) noise over the polar coordinates, masked with ring shape */
export { smokeRingFragmentShader, type SmokeRingParams, type SmokeRingUniforms } from './shaders/smoke-ring';

// ----- Neuro noise ----- //
/** A shader rendering a fractal-like structure made of several layers of since-arches */
export { neuroNoiseFragmentShader, type NeuroNoiseParams, type NeuroNoiseUniforms } from './shaders/neuro-noise';

// ----- Animated dot pattern: orbit type of animation ----- //
/** A shader rendering an animated dot pattern based on Voronoi diagram */
export { dotOrbitFragmentShader, type DotOrbitParams, type DotOrbitUniforms } from './shaders/dot-orbit';

// ----- Dot Grid ----- //
/** A shader rendering a static dot pattern */
export {
  dotGridFragmentShader,
  DotGridShapes,
  type DotGridShape,
  type DotGridParams,
  type DotGridUniforms,
} from './shaders/dot-grid';

// ----- Stepped simplex noise ----- //
/** A shader that calculates a combination of 2 simplex noises with result rendered as a stepped gradient */
export {
  steppedSimplexNoiseFragmentShader,
  type SteppedSimplexNoiseParams,
  type SteppedSimplexNoiseUniforms,
} from './shaders/stepped-simplex-noise';

// ----- Metaballs ----- //
/** A number of circlular shapes blened in a gooey way */
export { metaballsFragmentShader, type MetaballsParams, type MetaballsUniforms } from './shaders/metaballs';

// ----- Perlin noise ----- //
/** 2d noise with max number of parameters to be exposed to users */
export { perlinNoiseFragmentShader, type PerlinNoiseParams, type PerlinNoiseUniforms } from './shaders/perlin-noise';

// ----- Voronoi Diagram ----- //
/** Voronoi diagram: classic + rounded edges */
export { voronoiFragmentShader, type VoronoiParams, type VoronoiUniforms } from './shaders/voronoi';

// ----- Waves ----- //
/** Waves pattern */
export { wavesFragmentShader, type WavesParams, type WavesUniforms } from './shaders/waves';

// ----- Warping Distortion ----- //
/** Warp: distortion + swirl + underlying shapes */
export { warpFragmentShader, WarpPatterns, type WarpParams, type WarpUniforms, type WarpPattern } from './shaders/warp';

// ----- God Rays Effect ----- //
/** Radial shape made of randomized stripes */
export { godRaysFragmentShader, type GodRaysParams, type GodRaysUniforms } from './shaders/god-rays';

// ----- Spiral Shape ----- //
/** Single-color spiral shape */
export { spiralFragmentShader, type SpiralParams, type SpiralUniforms } from './shaders/spiral';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from './get-shader-color-from-string';
