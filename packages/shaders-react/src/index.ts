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

// Cloudy Ring
export { CloudyRing, cloudyRingDefaults } from './shaders/cloudy-ring';
export { type CloudyRingProps } from './shaders/cloudy-ring';
export { type CloudyRingUniforms } from '@paper-design/shaders';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from '@paper-design/shaders';
