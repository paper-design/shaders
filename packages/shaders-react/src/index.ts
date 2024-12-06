// ----- ShaderMount ----- //
export { ShaderMount } from './shader-mount';

// ----- Fragment shaders ----- //

// Grain clouds
export { GrainClouds, grainCloudsDefaults } from './shaders/grain-clouds';
export { type GrainCloudsProps } from './shaders/grain-clouds';
export { type GrainCloudsUniforms } from '@paper-design/shaders';

// Mesh gradient
export { MeshGradient, meshGradientDefaults } from './shaders/mesh-gradient';
export { type MeshGradientProps } from './shaders/mesh-gradient';
export { type MeshGradientUniforms } from '@paper-design/shaders';

// Neuro noise
export { NeuroNoise, neuroNoiseDefaults } from './shaders/neuro-noise';
export { type NeuroNoiseProps } from './shaders/neuro-noise';
export { type NeuroNoiseUniforms } from '@paper-design/shaders';

// Dots pattern
export { DotsPattern, dotsPatternDefaults } from './shaders/dots-pattern';
export { type DotsPatternProps } from './shaders/dots-pattern';
export { type DotsPatternUniforms } from '@paper-design/shaders';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from '@paper-design/shaders';
