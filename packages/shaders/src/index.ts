/** The core Shader Mounting class. Pass it a canvas element and a fragment shader to get started. */
export { ShaderMount } from './shader-mount';

// ----- Grain clouds ----- //
export { grainCloudsFragmentShader, type GrainCloudsUniforms } from './shaders/grain-clouds';

// ----- Mesh gradient ----- //
/** A shader that renders a mesh gradient with a rotating noise pattern and several layers of fractal noise */
export { meshGradientFragmentShader, type MeshGradientUniforms } from './shaders/mesh-gradient';

// ----- Smoke ring ----- //
/** Fractional Brownian motion (fBm) noise over the polar coordinates, masked with ring shape */
export { smokeRingFragmentShader, type SmokeRingUniforms } from './shaders/smoke-ring';

// ----- Neuro noise ----- //
/** A shader rendering a fractal-like structure made of several layers of since-arches */
export { neuroNoiseFragmentShader, type NeuroNoiseUniforms } from './shaders/neuro-noise';

/** A shader that calculates a combination of 2 simplex noises with result rendered as a stepped gradient */
export { steppedSimplexNoiseFragmentShader, type SteppedSimplexNoiseUniforms } from './shaders/stepped-simplex-noise';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from './shader-mount';
