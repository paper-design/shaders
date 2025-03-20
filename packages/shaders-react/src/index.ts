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

// Animated dot pattern: orbit type of animation
export { DotOrbit, dotOrbitPresets } from './shaders/dot-orbit';
export { type DotOrbitProps } from './shaders/dot-orbit';
export { type DotOrbitParams } from './shaders/dot-orbit';
export { type DotOrbitUniforms } from '@paper-design/shaders';

// Dot Grid
export { DotGrid, dotGridPresets } from './shaders/dot-grid';
export { type DotGridProps } from './shaders/dot-grid';
export { type DotGridParams } from './shaders/dot-grid';
export { type DotGridUniforms, DotGridShapes, type DotGridShape } from '@paper-design/shaders';

// Stepped simplex noise
export { SteppedSimplexNoise, steppedSimplexNoisePresets } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseProps } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseParams } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseUniforms } from '@paper-design/shaders';

// Metaballs
export { Metaballs, metaballsPresets } from './shaders/metaballs';
export { type MetaballsProps } from './shaders/metaballs';
export { type MetaballsParams } from './shaders/metaballs';
export { type MetaballsUniforms } from '@paper-design/shaders';

// Waves
export { Waves, wavesPresets } from './shaders/waves';
export { type WavesProps } from './shaders/waves';
export { type WavesParams } from './shaders/waves';
export { type WavesUniforms } from '@paper-design/shaders';

// Perlin noise
export { PerlinNoise, perlinNoisePresets } from './shaders/perlin-noise';
export { type PerlinNoiseProps } from './shaders/perlin-noise';
export { type PerlinNoiseParams } from './shaders/perlin-noise';
export { type PerlinNoiseUniforms } from '@paper-design/shaders';

// Voronoi diagram
export { Voronoi, voronoiPresets } from './shaders/voronoi';
export { type VoronoiProps } from './shaders/voronoi';
export { type VoronoiParams } from './shaders/voronoi';
export { type VoronoiUniforms } from '@paper-design/shaders';

// Warping distortion
export { Warp, warpPresets } from './shaders/warp';
export { type WarpProps } from './shaders/warp';
export { type WarpParams } from './shaders/warp';
export { type WarpUniforms, PatternShapes, type PatternShape } from '@paper-design/shaders';

// God Rays effect
export { GodRays, godRaysPresets } from './shaders/god-rays';
export { type GodRaysProps } from './shaders/god-rays';
export { type GodRaysParams } from './shaders/god-rays';
export { type GodRaysUniforms } from '@paper-design/shaders';

// Single-colored spiral shape
export { Spiral, spiralPresets } from './shaders/spiral';
export { type SpiralProps } from './shaders/spiral';
export { type SpiralParams } from './shaders/spiral';
export { type SpiralUniforms } from '@paper-design/shaders';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from '@paper-design/shaders';
