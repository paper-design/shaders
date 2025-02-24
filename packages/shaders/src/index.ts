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

// ----- Animated dots pattern: orbit type of animation ----- //
/** A shader rendering an animated dots pattern based on Voronoi diagram */
export { dotsOrbitFragmentShader, type DotsOrbitUniforms } from './shaders/dots-orbit';

// ----- Dot Grid ----- //
/** A shader rendering a static dots pattern */
export { dotsGridFragmentShader, DotsGridShapes, type DotsGridShape, type DotsGridUniforms } from './shaders/dots-grid';

// ----- Stepped simplex noise ----- //
/** A shader that calculates a combination of 2 simplex noises with result rendered as a stepped gradient */
export { steppedSimplexNoiseFragmentShader, type SteppedSimplexNoiseUniforms } from './shaders/stepped-simplex-noise';

// ----- Metaballs ----- //
/** A number of circlular shapes blened in a gooey way */
export { metaballsFragmentShader, type MetaballsUniforms } from './shaders/metaballs';

// ----- Perlin noise ----- //
/** 2d noise with max number of parameters to be exposed to users */
export { perlinNoiseFragmentShader, type PerlinNoiseUniforms } from './shaders/perlin-noise';

// ----- Voronoi Diagram ----- //
/** Voronoi diagram: classic + rounded edges */
export { voronoiFragmentShader, type VoronoiUniforms } from './shaders/voronoi';

// ----- Waves ----- //
/** Waves pattern */
export { wavesFragmentShader, type WavesUniforms } from './shaders/waves';

// ----- Warping Distortion ----- //
/** Warp: distortion + swirl + underlying shapes */
export { warpFragmentShader, PatternShapes, type PatternShape, type WarpUniforms } from './shaders/warp';

// ----- God Rays Effect ----- //
/** Radial shape made of randomized stripes */
export { godRaysFragmentShader, type GodRaysUniforms } from './shaders/god-rays';

// ----- Spiral Shape ----- //
/** Single-color spiral shape */
export { spiralFragmentShader, type SpiralUniforms } from './shaders/spiral';

// ----- Swirl Gradient ----- //
/** Colors mixed in the radial swirl shape */
export {swirlFragmentShader, type SwirlUniforms} from './shaders/swirl';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from './get-shader-color-from-string';
