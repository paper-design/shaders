// ----- ShaderMount ----- //
export { ShaderMount } from './shader-mount';

// ----- Fragment shaders ----- //

// Grain clouds
export { GrainClouds, grainCloudsPresets } from './shaders/grain-clouds';
export { type GrainCloudsProps } from './shaders/grain-clouds';
export { type GrainCloudsParams } from './shaders/grain-clouds';

// Mesh gradient
export { MeshGradient, meshGradientPresets } from './shaders/mesh-gradient';
export { type MeshGradientProps } from './shaders/mesh-gradient';
export { type MeshGradientParams } from './shaders/mesh-gradient';

// Smoke ring
export { SmokeRing, smokeRingPresets } from './shaders/smoke-ring';
export { type SmokeRingProps } from './shaders/smoke-ring';
export { type SmokeRingParams } from './shaders/smoke-ring';

// Neuro noise
export { NeuroNoise, neuroNoisePresets } from './shaders/neuro-noise';
export { type NeuroNoiseProps } from './shaders/neuro-noise';
export { type NeuroNoiseParams } from './shaders/neuro-noise';

// Animated dots pattern: orbit type of animation
export { DotsOrbit, dotsOrbitPresets } from './shaders/dots-orbit';
export { type DotsOrbitProps } from './shaders/dots-orbit';
export { type DotsOrbitParams } from './shaders/dots-orbit';

// Dot Grid
export { DotsGrid, dotsGridPresets } from './shaders/dots-grid';
export { type DotsGridProps } from './shaders/dots-grid';
export { type DotsGridParams } from './shaders/dots-grid';
export { DotsGridShapes, type DotsGridShape } from '@paper-design/shaders';

// Stepped simplex noise
export { SteppedSimplexNoise, steppedSimplexNoisePresets } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseProps } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseParams } from './shaders/stepped-simplex-noise';

// Metaballs
export { Metaballs, metaballsPresets } from './shaders/metaballs';
export { type MetaballsProps } from './shaders/metaballs';
export { type MetaballsParams } from './shaders/metaballs';

// Waves
export { Waves, wavesPresets } from './shaders/waves';
export { type WavesProps } from './shaders/waves';
export { type WavesParams } from './shaders/waves';

// Perlin noise
export { PerlinNoise, perlinNoisePresets } from './shaders/perlin-noise';
export { type PerlinNoiseProps } from './shaders/perlin-noise';
export { type PerlinNoiseParams } from './shaders/perlin-noise';

// Voronoi diagram
export { Voronoi, voronoiPresets } from './shaders/voronoi';
export { type VoronoiProps } from './shaders/voronoi';
export { type VoronoiParams } from './shaders/voronoi';

// Warping distortion
export { Warp, warpPresets } from './shaders/warp';
export { type WarpProps } from './shaders/warp';
export { type WarpParams } from './shaders/warp';
export { type PatternShapes, type PatternShape } from '@paper-design/shaders';

// God Rays effect
export { GodRays, godRaysPresets } from './shaders/god-rays';
export { type GodRaysProps } from './shaders/god-rays';
export { type GodRaysParams } from './shaders/god-rays';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from '@paper-design/shaders';
