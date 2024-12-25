// ----- ShaderMount ----- //
export { default as ShaderMount } from './shader-mount.vue';

// ----- Fragment shaders ----- //

// Grain clouds
export {
  default as GrainClouds,
  grainCloudsPresets,
  type GrainCloudsProps,
  type GrainCloudsParams,
} from './shaders/grain-clouds.vue';
export { type GrainCloudsUniforms } from '@paper-design/shaders';

// Mesh gradient
export {
  default as MeshGradient,
  meshGradientPresets,
  type MeshGradientProps,
  type MeshGradientParams,
} from './shaders/mesh-gradient.vue';
export { type MeshGradientUniforms } from '@paper-design/shaders';

// Smoke ring
export {
  default as SmokeRing,
  smokeRingPresets,
  type SmokeRingProps,
  type SmokeRingParams,
} from './shaders/smoke-ring.vue';
export { type SmokeRingUniforms } from '@paper-design/shaders';

// Neuro noise
export {
  default as NeuroNoise,
  neuroNoisePresets,
  type NeuroNoiseProps,
  type NeuroNoiseParams,
} from './shaders/neuro-noise.vue';
export { type NeuroNoiseUniforms } from '@paper-design/shaders';

// Animated dots pattern: orbit type of animation
export {
  default as DotsOrbit,
  dotsOrbitPresets,
  type DotsOrbitProps,
  type DotsOrbitParams,
} from './shaders/dots-orbit.vue';
export type { DotsOrbitUniforms } from '@paper-design/shaders';

// Stepped simplex noise
export {
  default as SteppedSimplexNoise,
  steppedSimplexNoisePresets,
  type SteppedSimplexNoiseProps,
  type SteppedSimplexNoiseParams,
} from './shaders/stepped-simplex-noise.vue';
export { type SteppedSimplexNoiseUniforms } from '@paper-design/shaders';

// Metaballs
export {
  default as Metaballs,
  metaballsPresets,
  type MetaballsProps,
  type MetaballsParams,
} from './shaders/metaballs.vue';
export { type MetaballsUniforms } from '@paper-design/shaders';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from '@paper-design/shaders';
