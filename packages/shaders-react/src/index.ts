// ----- ShaderMount ----- //
export { ShaderMount } from './shader-mount';

// ----- Fragment shaders ----- //

// Grain clouds
export { GrainClouds, grainCloudsPresets } from './shaders/grain-clouds';
export { type GrainCloudsProps } from './shaders/grain-clouds';
export { type GrainCloudsParams } from './shaders/grain-clouds';
export { type GrainCloudsUniforms } from '@paper-design/shaders';

// Mesh gradient
export { MeshGradient, meshGradientPresets } from './shaders/mesh-gradient';
export { type MeshGradientProps } from './shaders/mesh-gradient';
export { type MeshGradientParams } from './shaders/mesh-gradient';
export { type MeshGradientUniforms } from '@paper-design/shaders';

// Smoke ring
export { SmokeRing, smokeRingPresets } from './shaders/smoke-ring';
export { type SmokeRingProps } from './shaders/smoke-ring';
export { type SmokeRingParams } from './shaders/smoke-ring';
export { type SmokeRingUniforms } from '@paper-design/shaders';

// Neuro noise
export { NeuroNoise, neuroNoisePresets } from './shaders/neuro-noise';
export { type NeuroNoiseProps } from './shaders/neuro-noise';
export { type NeuroNoiseParams } from './shaders/neuro-noise';
export { type NeuroNoiseUniforms } from '@paper-design/shaders';

// Animated dots pattern: orbit type of animation
export { DotsOrbit, dotsOrbitPresets } from './shaders/dots-orbit';
export { type DotsOrbitProps } from './shaders/dots-orbit';
export { type DotsOrbitParams } from './shaders/dots-orbit';
export { type DotsOrbitUniforms } from '@paper-design/shaders';

// Static grid made of dots (or other shapes)
export { DotsGrid, dotsGridPresets } from './shaders/dots-grid';
export { type DotsGridProps } from './shaders/dots-grid';
export { type DotsGridParams } from './shaders/dots-grid';
export { type DotsGridUniforms } from '@paper-design/shaders';

// Stepped simplex noise
export { SteppedSimplexNoise, steppedSimplexNoisePresets } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseProps } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseParams } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseUniforms } from '@paper-design/shaders';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from '@paper-design/shaders';
