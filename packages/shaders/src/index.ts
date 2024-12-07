/** The core Shader Mounting class. Pass it a canvas element and a fragment shader to get started. */
export { ShaderMount } from './shader-mount';

// ----- Fragment shaders ----- //
/** An example fragment shader that renders a grainy texture over top of blobby animated clouds */
export { grainCloudsFragmentShader, type GrainCloudsUniforms } from './shaders/grain-clouds';

/** A shader that renders a mesh gradient with a rotating noise pattern and several layers of fractal noise */
export { meshGradientFragmentShader, type MeshGradientUniforms } from './shaders/mesh-gradient';

/** A shader rendering a fractal-like structure made of several layers of since-arches */
export { neuroNoiseFragmentShader, type NeuroNoiseUniforms } from './shaders/neuro-noise';

/** A shader rendering an animated dots pattern based on Voronoi diagram */
export { dotsPatternFragmentShader, type DotsPatternUniforms } from './shaders/dots-pattern';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from './shader-mount';
