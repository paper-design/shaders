// ----- ShaderMount ----- //
export { ShaderMount } from './shader-mount';

// ----- Fragment shaders ----- //

// Mesh gradient
export { MeshGradient, meshGradientPresets } from './shaders/mesh-gradient';
export { type MeshGradientProps } from './shaders/mesh-gradient';
export { type MeshGradientUniforms, type MeshGradientParams } from '@paper-design/shaders';

// Smoke ring
export { SmokeRing, smokeRingPresets } from './shaders/smoke-ring';
export { type SmokeRingProps } from './shaders/smoke-ring';
export { type SmokeRingUniforms, type SmokeRingParams } from '@paper-design/shaders';

// Neuro noise
export { NeuroNoise, neuroNoisePresets } from './shaders/neuro-noise';
export { type NeuroNoiseProps } from './shaders/neuro-noise';
export { type NeuroNoiseUniforms, type NeuroNoiseParams } from '@paper-design/shaders';

// Animated dot pattern: orbit type of animation
export { DotOrbit, dotOrbitPresets } from './shaders/dot-orbit';
export { type DotOrbitProps } from './shaders/dot-orbit';
export { type DotOrbitUniforms, type DotOrbitParams } from '@paper-design/shaders';

// Dot Grid
export { DotGrid, dotGridPresets } from './shaders/dot-grid';
export { type DotGridProps } from './shaders/dot-grid';
export { type DotGridUniforms, type DotGridParams, DotGridShapes, type DotGridShape } from '@paper-design/shaders';

// Stepped simplex noise
export { SteppedSimplexNoise, steppedSimplexNoisePresets } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseProps } from './shaders/stepped-simplex-noise';
export { type SteppedSimplexNoiseUniforms, type SteppedSimplexNoiseParams } from '@paper-design/shaders';

// Metaballs
export { Metaballs, metaballsPresets } from './shaders/metaballs';
export { type MetaballsProps } from './shaders/metaballs';
export { type MetaballsUniforms, type MetaballsParams } from '@paper-design/shaders';

// Waves
export { Waves, wavesPresets } from './shaders/waves';
export { type WavesProps } from './shaders/waves';
export { type WavesUniforms, type WavesParams } from '@paper-design/shaders';

// Perlin noise
export { PerlinNoise, perlinNoisePresets } from './shaders/perlin-noise';
export { type PerlinNoiseProps } from './shaders/perlin-noise';
export { type PerlinNoiseUniforms, type PerlinNoiseParams } from '@paper-design/shaders';

// Voronoi diagram
export { Voronoi, voronoiPresets } from './shaders/voronoi';
export { type VoronoiProps } from './shaders/voronoi';
export { type VoronoiUniforms, type VoronoiParams } from '@paper-design/shaders';

// Warping distortion
export { Warp, warpPresets } from './shaders/warp';
export { type WarpProps } from './shaders/warp';
export { type WarpUniforms, type WarpParams, WarpPatterns, type WarpPattern } from '@paper-design/shaders';

// God Rays effect
export { GodRays, godRaysPresets } from './shaders/god-rays';
export { type GodRaysProps } from './shaders/god-rays';
export { type GodRaysUniforms, type GodRaysParams } from '@paper-design/shaders';

// Single-colored spiral shape
export { Spiral, spiralPresets } from './shaders/spiral';
export { type SpiralProps } from './shaders/spiral';
export { type SpiralUniforms, type SpiralParams } from '@paper-design/shaders';

// Dithering over abstract shapes
export { Dithering, ditheringPresets } from './shaders/dithering';
export { type DitheringProps } from './shaders/dithering';
export { type DitheringUniforms, type DitheringParams } from '@paper-design/shaders';

// ----- Uniform conversion utils ----- //
export { getShaderColorFromString } from '@paper-design/shaders';
