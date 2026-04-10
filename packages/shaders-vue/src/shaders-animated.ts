import {
  GrainGradientShapes,
  PulsingBorderAspectRatios,
  ShaderFitOptions,
  WarpPatterns,
  defaultObjectSizing,
  defaultPatternSizing,
  dotOrbitFragmentShader,
  getShaderColorFromString,
  getShaderNoiseTexture,
  godRaysFragmentShader,
  grainGradientFragmentShader,
  meshGradientFragmentShader,
  metaballsFragmentShader,
  neuroNoiseFragmentShader,
  perlinNoiseFragmentShader,
  pulsingBorderFragmentShader,
  simplexNoiseFragmentShader,
  smokeRingFragmentShader,
  spiralFragmentShader,
  swirlFragmentShader,
  voronoiFragmentShader,
  warpFragmentShader,
  type DotOrbitParams,
  type DotOrbitUniforms,
  type GodRaysParams,
  type GodRaysUniforms,
  type GrainGradientParams,
  type GrainGradientUniforms,
  type MeshGradientParams,
  type MeshGradientUniforms,
  type MetaballsParams,
  type MetaballsUniforms,
  type NeuroNoiseParams,
  type NeuroNoiseUniforms,
  type PerlinNoiseParams,
  type PerlinNoiseUniforms,
  type PulsingBorderParams,
  type PulsingBorderUniforms,
  type ShaderPreset,
  type SimplexNoiseParams,
  type SimplexNoiseUniforms,
  type SmokeRingParams,
  type SmokeRingUniforms,
  type SpiralParams,
  type SpiralUniforms,
  type SwirlParams,
  type SwirlUniforms,
  type VoronoiParams,
  type VoronoiUniforms,
  type WarpParams,
  type WarpUniforms,
} from '@paper-design/shaders';
import { createShaderComponent, shaderComponentPropNames } from './create-shader-component.js';
import type { ShaderComponentProps } from './shader-mount.js';

export interface MeshGradientProps extends ShaderComponentProps, MeshGradientParams {}

const meshGradientDefaultPreset: ShaderPreset<MeshGradientParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['#e0eaff', '#241d9a', '#f75092', '#9f50d3'],
    distortion: 0.8,
    swirl: 0.1,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

const meshGradientPurplePreset: ShaderPreset<MeshGradientParams> = {
  name: 'Purple',
  params: {
    ...defaultObjectSizing,
    speed: 0.6,
    frame: 0,
    colors: ['#aaa7d7', '#3c2b8e'],
    distortion: 1,
    swirl: 1,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

const meshGradientBeachPreset: ShaderPreset<MeshGradientParams> = {
  name: 'Beach',
  params: {
    ...defaultObjectSizing,
    speed: 0.1,
    frame: 0,
    colors: ['#bcecf6', '#00aaff', '#00f7ff', '#ffd447'],
    distortion: 0.8,
    swirl: 0.35,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

const meshGradientInkPreset: ShaderPreset<MeshGradientParams> = {
  name: 'Ink',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['#ffffff', '#000000'],
    distortion: 1,
    swirl: 0.2,
    rotation: 90,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const meshGradientPresets = [
  meshGradientDefaultPreset,
  meshGradientInkPreset,
  meshGradientPurplePreset,
  meshGradientBeachPreset,
] satisfies ShaderPreset<MeshGradientParams>[];

export const MeshGradient = createShaderComponent<MeshGradientProps>(
  'MeshGradient',
  shaderComponentPropNames(meshGradientDefaultPreset.params),
  ({
    speed = meshGradientDefaultPreset.params.speed,
    frame = meshGradientDefaultPreset.params.frame,
    colors = meshGradientDefaultPreset.params.colors,
    distortion = meshGradientDefaultPreset.params.distortion,
    swirl = meshGradientDefaultPreset.params.swirl,
    grainMixer = meshGradientDefaultPreset.params.grainMixer,
    grainOverlay = meshGradientDefaultPreset.params.grainOverlay,
    fit = meshGradientDefaultPreset.params.fit,
    rotation = meshGradientDefaultPreset.params.rotation,
    scale = meshGradientDefaultPreset.params.scale,
    originX = meshGradientDefaultPreset.params.originX,
    originY = meshGradientDefaultPreset.params.originY,
    offsetX = meshGradientDefaultPreset.params.offsetX,
    offsetY = meshGradientDefaultPreset.params.offsetY,
    worldWidth = meshGradientDefaultPreset.params.worldWidth,
    worldHeight = meshGradientDefaultPreset.params.worldHeight,
    ...props
  }: MeshGradientProps) => {
    const uniforms = {
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_distortion: distortion,
      u_swirl: swirl,
      u_grainMixer: grainMixer,
      u_grainOverlay: grainOverlay,
      u_fit: ShaderFitOptions[fit],
      u_rotation: rotation,
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies MeshGradientUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: meshGradientFragmentShader,
      uniforms,
    };
  }
);

export interface SmokeRingProps extends ShaderComponentProps, SmokeRingParams {}

const smokeRingDefaultPreset: ShaderPreset<SmokeRingParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 0.5,
    frame: 0,
    colorBack: '#000000',
    colors: ['#ffffff'],
    noiseScale: 3,
    noiseIterations: 8,
    radius: 0.25,
    thickness: 0.65,
    innerShape: 0.7,
    scale: 0.8,
  },
};

const smokeRingSolarPreset: ShaderPreset<SmokeRingParams> = {
  name: 'Solar',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#ffffff', '#ffca0a', '#fc6203', '#fc620366'],
    noiseScale: 2,
    noiseIterations: 3,
    radius: 0.4,
    thickness: 0.8,
    innerShape: 4,
    scale: 2,
    offsetY: 1,
  },
};

const smokeRingLinePreset: ShaderPreset<SmokeRingParams> = {
  name: 'Line',
  params: {
    ...defaultObjectSizing,
    frame: 0,
    colorBack: '#000000',
    colors: ['#4540a4', '#1fe8ff'],
    noiseScale: 1.1,
    noiseIterations: 2,
    radius: 0.38,
    thickness: 0.01,
    innerShape: 0.88,
    speed: 4,
  },
};

const smokeRingCloudPreset: ShaderPreset<SmokeRingParams> = {
  name: 'Cloud',
  params: {
    ...defaultObjectSizing,
    frame: 0,
    colorBack: '#81ADEC',
    colors: ['#ffffff'],
    noiseScale: 3,
    noiseIterations: 10,
    radius: 0.5,
    thickness: 0.65,
    innerShape: 0.85,
    speed: 0.5,
    scale: 2.5,
  },
};

export const smokeRingPresets = [
  smokeRingDefaultPreset,
  smokeRingLinePreset,
  smokeRingSolarPreset,
  smokeRingCloudPreset,
] satisfies ShaderPreset<SmokeRingParams>[];

export const SmokeRing = createShaderComponent<SmokeRingProps>(
  'SmokeRing',
  shaderComponentPropNames(smokeRingDefaultPreset.params),
  ({
    speed = smokeRingDefaultPreset.params.speed,
    frame = smokeRingDefaultPreset.params.frame,
    colorBack = smokeRingDefaultPreset.params.colorBack,
    colors = smokeRingDefaultPreset.params.colors,
    noiseScale = smokeRingDefaultPreset.params.noiseScale,
    thickness = smokeRingDefaultPreset.params.thickness,
    radius = smokeRingDefaultPreset.params.radius,
    innerShape = smokeRingDefaultPreset.params.innerShape,
    noiseIterations = smokeRingDefaultPreset.params.noiseIterations,
    fit = smokeRingDefaultPreset.params.fit,
    scale = smokeRingDefaultPreset.params.scale,
    rotation = smokeRingDefaultPreset.params.rotation,
    originX = smokeRingDefaultPreset.params.originX,
    originY = smokeRingDefaultPreset.params.originY,
    offsetX = smokeRingDefaultPreset.params.offsetX,
    offsetY = smokeRingDefaultPreset.params.offsetY,
    worldWidth = smokeRingDefaultPreset.params.worldWidth,
    worldHeight = smokeRingDefaultPreset.params.worldHeight,
    ...props
  }: SmokeRingProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_noiseScale: noiseScale,
      u_thickness: thickness,
      u_radius: radius,
      u_innerShape: innerShape,
      u_noiseIterations: noiseIterations,
      u_noiseTexture: getShaderNoiseTexture(),
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies SmokeRingUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: smokeRingFragmentShader,
      uniforms,
    };
  }
);

export interface NeuroNoiseProps extends ShaderComponentProps, NeuroNoiseParams {}

const neuroNoiseDefaultPreset: ShaderPreset<NeuroNoiseParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorFront: '#ffffff',
    colorMid: '#47a6ff',
    colorBack: '#000000',
    brightness: 0.05,
    contrast: 0.3,
  },
};

const neuroNoiseSensationPreset: ShaderPreset<NeuroNoiseParams> = {
  name: 'Sensation',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorFront: '#00c8ff',
    colorMid: '#fbff00',
    colorBack: '#8b42ff',
    brightness: 0.19,
    contrast: 0.12,
    scale: 3,
  },
};

const neuroNoiseBloodstreamPreset: ShaderPreset<NeuroNoiseParams> = {
  name: 'Bloodstream',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorFront: '#ff0000',
    colorMid: '#ff0000',
    colorBack: '#ffffff',
    brightness: 0.24,
    contrast: 0.17,
    scale: 0.7,
  },
};

const neuroNoiseGhostPreset: ShaderPreset<NeuroNoiseParams> = {
  name: 'Ghost',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorFront: '#ffffff',
    colorMid: '#000000',
    colorBack: '#ffffff',
    brightness: 0,
    contrast: 1,
    scale: 0.55,
  },
};

export const neuroNoisePresets = [
  neuroNoiseDefaultPreset,
  neuroNoiseSensationPreset,
  neuroNoiseBloodstreamPreset,
  neuroNoiseGhostPreset,
] satisfies ShaderPreset<NeuroNoiseParams>[];

export const NeuroNoise = createShaderComponent<NeuroNoiseProps>(
  'NeuroNoise',
  shaderComponentPropNames(neuroNoiseDefaultPreset.params),
  ({
    speed = neuroNoiseDefaultPreset.params.speed,
    frame = neuroNoiseDefaultPreset.params.frame,
    colorFront = neuroNoiseDefaultPreset.params.colorFront,
    colorMid = neuroNoiseDefaultPreset.params.colorMid,
    colorBack = neuroNoiseDefaultPreset.params.colorBack,
    brightness = neuroNoiseDefaultPreset.params.brightness,
    contrast = neuroNoiseDefaultPreset.params.contrast,
    fit = neuroNoiseDefaultPreset.params.fit,
    scale = neuroNoiseDefaultPreset.params.scale,
    rotation = neuroNoiseDefaultPreset.params.rotation,
    originX = neuroNoiseDefaultPreset.params.originX,
    originY = neuroNoiseDefaultPreset.params.originY,
    offsetX = neuroNoiseDefaultPreset.params.offsetX,
    offsetY = neuroNoiseDefaultPreset.params.offsetY,
    worldWidth = neuroNoiseDefaultPreset.params.worldWidth,
    worldHeight = neuroNoiseDefaultPreset.params.worldHeight,
    ...props
  }: NeuroNoiseProps) => {
    const uniforms = {
      u_colorFront: getShaderColorFromString(colorFront),
      u_colorMid: getShaderColorFromString(colorMid),
      u_colorBack: getShaderColorFromString(colorBack),
      u_brightness: brightness,
      u_contrast: contrast,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies NeuroNoiseUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: neuroNoiseFragmentShader,
      uniforms,
    };
  }
);

export interface DotOrbitProps extends ShaderComponentProps, DotOrbitParams {}

const dotOrbitDefaultPreset: ShaderPreset<DotOrbitParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1.5,
    frame: 0,
    colorBack: '#000000',
    colors: ['#ffc96b', '#ff6200', '#ff2f00', '#421100', '#1a0000'],
    size: 1,
    sizeRange: 0,
    spreading: 1,
    stepsPerColor: 4,
  },
};

const dotOrbitShinePreset: ShaderPreset<DotOrbitParams> = {
  name: 'Shine',
  params: {
    ...defaultPatternSizing,
    speed: 0.1,
    frame: 0,
    colors: ['#ffffff', '#006aff', '#fff675'],
    colorBack: '#000000',
    stepsPerColor: 4,
    size: 0.3,
    sizeRange: 0.2,
    spreading: 1,
    scale: 0.4,
  },
};

const dotOrbitBubblesPreset: ShaderPreset<DotOrbitParams> = {
  name: 'Bubbles',
  params: {
    ...defaultPatternSizing,
    speed: 0.4,
    frame: 0,
    colors: ['#D0D2D5'],
    colorBack: '#989CA4',
    stepsPerColor: 2,
    size: 0.9,
    sizeRange: 0.7,
    spreading: 1,
    scale: 1.64,
  },
};

const dotOrbitHallucinatoryPreset: ShaderPreset<DotOrbitParams> = {
  name: 'Hallucinatory',
  params: {
    ...defaultPatternSizing,
    speed: 5,
    frame: 0,
    colors: ['#000000'],
    colorBack: '#ffe500',
    stepsPerColor: 2,
    size: 0.65,
    sizeRange: 0,
    spreading: 0.3,
    scale: 0.5,
  },
};

export const dotOrbitPresets = [
  dotOrbitDefaultPreset,
  dotOrbitBubblesPreset,
  dotOrbitShinePreset,
  dotOrbitHallucinatoryPreset,
] satisfies ShaderPreset<DotOrbitParams>[];

export const DotOrbit = createShaderComponent<DotOrbitProps>(
  'DotOrbit',
  shaderComponentPropNames(dotOrbitDefaultPreset.params),
  ({
    speed = dotOrbitDefaultPreset.params.speed,
    frame = dotOrbitDefaultPreset.params.frame,
    colorBack = dotOrbitDefaultPreset.params.colorBack,
    colors = dotOrbitDefaultPreset.params.colors,
    size = dotOrbitDefaultPreset.params.size,
    sizeRange = dotOrbitDefaultPreset.params.sizeRange,
    spreading = dotOrbitDefaultPreset.params.spreading,
    stepsPerColor = dotOrbitDefaultPreset.params.stepsPerColor,
    fit = dotOrbitDefaultPreset.params.fit,
    scale = dotOrbitDefaultPreset.params.scale,
    rotation = dotOrbitDefaultPreset.params.rotation,
    originX = dotOrbitDefaultPreset.params.originX,
    originY = dotOrbitDefaultPreset.params.originY,
    offsetX = dotOrbitDefaultPreset.params.offsetX,
    offsetY = dotOrbitDefaultPreset.params.offsetY,
    worldWidth = dotOrbitDefaultPreset.params.worldWidth,
    worldHeight = dotOrbitDefaultPreset.params.worldHeight,
    ...props
  }: DotOrbitProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_size: size,
      u_sizeRange: sizeRange,
      u_spreading: spreading,
      u_stepsPerColor: stepsPerColor,
      u_noiseTexture: getShaderNoiseTexture(),
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies DotOrbitUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: dotOrbitFragmentShader,
      uniforms,
    };
  }
);

export interface SimplexNoiseProps extends ShaderComponentProps, SimplexNoiseParams {}

const simplexNoiseDefaultPreset: ShaderPreset<SimplexNoiseParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    scale: 0.6,
    speed: 0.5,
    frame: 0,
    colors: ['#4449CF', '#FFD1E0', '#F94446', '#FFD36B', '#FFFFFF'],
    stepsPerColor: 2,
    softness: 0,
  },
};

const simplexNoiseBubblegumPreset: ShaderPreset<SimplexNoiseParams> = {
  name: 'Bubblegum',
  params: {
    ...defaultPatternSizing,
    speed: 2,
    frame: 0,
    colors: ['#ffffff', '#ff9e9e', '#5f57ff', '#00f7ff'],
    stepsPerColor: 1,
    softness: 1,
    scale: 1.6,
  },
};

const simplexNoiseSpotsPreset: ShaderPreset<SimplexNoiseParams> = {
  name: 'Spots',
  params: {
    ...defaultPatternSizing,
    speed: 0.6,
    frame: 0,
    colors: ['#ff7b00', '#f9ffeb', '#320d82'],
    stepsPerColor: 1,
    softness: 0,
    scale: 1,
  },
};

const simplexNoiseFirstContactPreset: ShaderPreset<SimplexNoiseParams> = {
  name: 'First contact',
  params: {
    ...defaultPatternSizing,
    speed: 2,
    frame: 0,
    colors: ['#e8cce6', '#120d22', '#442c44', '#e6baba', '#fff5f5'],
    stepsPerColor: 2,
    softness: 0,
    scale: 0.2,
  },
};

export const simplexNoisePresets = [
  simplexNoiseDefaultPreset,
  simplexNoiseSpotsPreset,
  simplexNoiseFirstContactPreset,
  simplexNoiseBubblegumPreset,
] satisfies ShaderPreset<SimplexNoiseParams>[];

export const SimplexNoise = createShaderComponent<SimplexNoiseProps>(
  'SimplexNoise',
  shaderComponentPropNames(simplexNoiseDefaultPreset.params),
  ({
    speed = simplexNoiseDefaultPreset.params.speed,
    frame = simplexNoiseDefaultPreset.params.frame,
    colors = simplexNoiseDefaultPreset.params.colors,
    stepsPerColor = simplexNoiseDefaultPreset.params.stepsPerColor,
    softness = simplexNoiseDefaultPreset.params.softness,
    fit = simplexNoiseDefaultPreset.params.fit,
    scale = simplexNoiseDefaultPreset.params.scale,
    rotation = simplexNoiseDefaultPreset.params.rotation,
    originX = simplexNoiseDefaultPreset.params.originX,
    originY = simplexNoiseDefaultPreset.params.originY,
    offsetX = simplexNoiseDefaultPreset.params.offsetX,
    offsetY = simplexNoiseDefaultPreset.params.offsetY,
    worldWidth = simplexNoiseDefaultPreset.params.worldWidth,
    worldHeight = simplexNoiseDefaultPreset.params.worldHeight,
    ...props
  }: SimplexNoiseProps) => {
    const uniforms = {
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_stepsPerColor: stepsPerColor,
      u_softness: softness,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies SimplexNoiseUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: simplexNoiseFragmentShader,
      uniforms,
    };
  }
);

export interface MetaballsProps extends ShaderComponentProps, MetaballsParams {}

const metaballsDefaultPreset: ShaderPreset<MetaballsParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#6e33cc', '#ff5500', '#ffc105', '#ffc800', '#f585ff'],
    count: 10,
    size: 0.83,
  },
};

const metaballsInkDropsPreset: ShaderPreset<MetaballsParams> = {
  name: 'Ink Drops',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 2,
    frame: 0,
    colorBack: '#ffffff00',
    colors: ['#000000'],
    count: 18,
    size: 0.1,
  },
};

const metaballsBackgroundPreset: ShaderPreset<MetaballsParams> = {
  name: 'Background',
  params: {
    ...defaultObjectSizing,
    speed: 0.5,
    frame: 0,
    colors: ['#ae00ff', '#00ff95', '#ffc105'],
    colorBack: '#2a273f',
    count: 13,
    size: 0.81,
    scale: 4,
    rotation: 0,
    offsetX: -0.3,
  },
};

const metaballsSolarPreset: ShaderPreset<MetaballsParams> = {
  name: 'Solar',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['#ffc800', '#ff5500', '#ffc105'],
    colorBack: '#102f84',
    count: 7,
    size: 0.75,
    scale: 1,
  },
};

export const metaballsPresets = [
  metaballsDefaultPreset,
  metaballsInkDropsPreset,
  metaballsSolarPreset,
  metaballsBackgroundPreset,
] satisfies ShaderPreset<MetaballsParams>[];

export const Metaballs = createShaderComponent<MetaballsProps>(
  'Metaballs',
  shaderComponentPropNames(metaballsDefaultPreset.params),
  ({
    speed = metaballsDefaultPreset.params.speed,
    frame = metaballsDefaultPreset.params.frame,
    colorBack = metaballsDefaultPreset.params.colorBack,
    colors = metaballsDefaultPreset.params.colors,
    size = metaballsDefaultPreset.params.size,
    count = metaballsDefaultPreset.params.count,
    fit = metaballsDefaultPreset.params.fit,
    rotation = metaballsDefaultPreset.params.rotation,
    scale = metaballsDefaultPreset.params.scale,
    originX = metaballsDefaultPreset.params.originX,
    originY = metaballsDefaultPreset.params.originY,
    offsetX = metaballsDefaultPreset.params.offsetX,
    offsetY = metaballsDefaultPreset.params.offsetY,
    worldWidth = metaballsDefaultPreset.params.worldWidth,
    worldHeight = metaballsDefaultPreset.params.worldHeight,
    ...props
  }: MetaballsProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_size: size,
      u_count: count,
      u_noiseTexture: getShaderNoiseTexture(),
      u_fit: ShaderFitOptions[fit],
      u_rotation: rotation,
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies MetaballsUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: metaballsFragmentShader,
      uniforms,
    };
  }
);

export interface PerlinNoiseProps extends ShaderComponentProps, PerlinNoiseParams {}

const perlinNoiseDefaultPreset: ShaderPreset<PerlinNoiseParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    colorBack: '#632ad5',
    colorFront: '#fccff7',
    proportion: 0.35,
    softness: 0.1,
    octaveCount: 1,
    persistence: 1,
    lacunarity: 1.5,
  },
};

const perlinNoiseNintendoWaterPreset: ShaderPreset<PerlinNoiseParams> = {
  name: 'Nintendo Water',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.2,
    speed: 0.4,
    frame: 0,
    colorBack: '#2d69d4',
    colorFront: '#d1eefc',
    proportion: 0.42,
    softness: 0,
    octaveCount: 2,
    persistence: 0.55,
    lacunarity: 1.8,
  },
};

const perlinNoiseMossPreset: ShaderPreset<PerlinNoiseParams> = {
  name: 'Moss',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.15,
    speed: 0.02,
    frame: 0,
    colorBack: '#05ff4a',
    colorFront: '#262626',
    proportion: 0.65,
    softness: 0.35,
    octaveCount: 6,
    persistence: 1,
    lacunarity: 2.55,
  },
};

const perlinNoiseWormsPreset: ShaderPreset<PerlinNoiseParams> = {
  name: 'Worms',
  params: {
    ...defaultPatternSizing,
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorBack: '#ffffff00',
    colorFront: '#595959',
    proportion: 0.5,
    softness: 0,
    octaveCount: 1,
    persistence: 1,
    lacunarity: 1.5,
  },
};

export const perlinNoisePresets = [
  perlinNoiseDefaultPreset,
  perlinNoiseNintendoWaterPreset,
  perlinNoiseMossPreset,
  perlinNoiseWormsPreset,
] satisfies ShaderPreset<PerlinNoiseParams>[];

export const PerlinNoise = createShaderComponent<PerlinNoiseProps>(
  'PerlinNoise',
  shaderComponentPropNames(perlinNoiseDefaultPreset.params),
  ({
    speed = perlinNoiseDefaultPreset.params.speed,
    frame = perlinNoiseDefaultPreset.params.frame,
    colorFront = perlinNoiseDefaultPreset.params.colorFront,
    colorBack = perlinNoiseDefaultPreset.params.colorBack,
    proportion = perlinNoiseDefaultPreset.params.proportion,
    softness = perlinNoiseDefaultPreset.params.softness,
    octaveCount = perlinNoiseDefaultPreset.params.octaveCount,
    persistence = perlinNoiseDefaultPreset.params.persistence,
    lacunarity,
    fit = perlinNoiseDefaultPreset.params.fit,
    worldWidth = perlinNoiseDefaultPreset.params.worldWidth,
    worldHeight = perlinNoiseDefaultPreset.params.worldHeight,
    scale = perlinNoiseDefaultPreset.params.scale,
    rotation = perlinNoiseDefaultPreset.params.rotation,
    originX = perlinNoiseDefaultPreset.params.originX,
    originY = perlinNoiseDefaultPreset.params.originY,
    offsetX = perlinNoiseDefaultPreset.params.offsetX,
    offsetY = perlinNoiseDefaultPreset.params.offsetY,
    ...props
  }: PerlinNoiseProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colorFront: getShaderColorFromString(colorFront),
      u_proportion: proportion,
      u_softness: softness ?? perlinNoiseDefaultPreset.params.softness,
      u_octaveCount: octaveCount ?? perlinNoiseDefaultPreset.params.octaveCount,
      u_persistence: persistence ?? perlinNoiseDefaultPreset.params.persistence,
      u_lacunarity: lacunarity ?? perlinNoiseDefaultPreset.params.lacunarity,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies PerlinNoiseUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: perlinNoiseFragmentShader,
      uniforms,
    };
  }
);

export interface VoronoiProps extends ShaderComponentProps, VoronoiParams {}

const voronoiDefaultPreset: ShaderPreset<VoronoiParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    colors: ['#ff8247', '#ffe53d'],
    stepsPerColor: 3,
    colorGlow: '#ffffff',
    colorGap: '#2e0000',
    distortion: 0.4,
    gap: 0.04,
    glow: 0,
    scale: 0.5,
  },
};

const voronoiCellsPreset: ShaderPreset<VoronoiParams> = {
  name: 'Cells',
  params: {
    ...defaultPatternSizing,
    scale: 0.5,
    speed: 0.5,
    frame: 0,
    colors: ['#ffffff'],
    stepsPerColor: 1,
    colorGlow: '#ffffff',
    colorGap: '#000000',
    distortion: 0.5,
    gap: 0.03,
    glow: 0.8,
  },
};

const voronoiBubblesPreset: ShaderPreset<VoronoiParams> = {
  name: 'Bubbles',
  params: {
    ...defaultPatternSizing,
    scale: 0.75,
    speed: 0.5,
    frame: 0,
    colors: ['#83c9fb'],
    stepsPerColor: 1,
    colorGlow: '#ffffff',
    colorGap: '#ffffff',
    distortion: 0.4,
    gap: 0,
    glow: 1,
  },
};

const voronoiLightsPreset: ShaderPreset<VoronoiParams> = {
  name: 'Lights',
  params: {
    ...defaultPatternSizing,
    scale: 3.3,
    speed: 0.5,
    frame: 0,
    colors: ['#fffffffc', '#bbff00', '#00ffff'],
    colorGlow: '#ff00d0',
    colorGap: '#ff00d0',
    stepsPerColor: 2,
    distortion: 0.38,
    gap: 0,
    glow: 1,
  },
};

export const voronoiPresets = [
  voronoiDefaultPreset,
  voronoiLightsPreset,
  voronoiCellsPreset,
  voronoiBubblesPreset,
] satisfies ShaderPreset<VoronoiParams>[];

export const Voronoi = createShaderComponent<VoronoiProps>(
  'Voronoi',
  shaderComponentPropNames(voronoiDefaultPreset.params),
  ({
    speed = voronoiDefaultPreset.params.speed,
    frame = voronoiDefaultPreset.params.frame,
    colors = voronoiDefaultPreset.params.colors,
    stepsPerColor = voronoiDefaultPreset.params.stepsPerColor,
    colorGlow = voronoiDefaultPreset.params.colorGlow,
    colorGap = voronoiDefaultPreset.params.colorGap,
    distortion = voronoiDefaultPreset.params.distortion,
    gap = voronoiDefaultPreset.params.gap,
    glow = voronoiDefaultPreset.params.glow,
    fit = voronoiDefaultPreset.params.fit,
    scale = voronoiDefaultPreset.params.scale,
    rotation = voronoiDefaultPreset.params.rotation,
    originX = voronoiDefaultPreset.params.originX,
    originY = voronoiDefaultPreset.params.originY,
    offsetX = voronoiDefaultPreset.params.offsetX,
    offsetY = voronoiDefaultPreset.params.offsetY,
    worldWidth = voronoiDefaultPreset.params.worldWidth,
    worldHeight = voronoiDefaultPreset.params.worldHeight,
    ...props
  }: VoronoiProps) => {
    const uniforms = {
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_stepsPerColor: stepsPerColor,
      u_colorGlow: getShaderColorFromString(colorGlow),
      u_colorGap: getShaderColorFromString(colorGap),
      u_distortion: distortion,
      u_gap: gap,
      u_glow: glow,
      u_noiseTexture: getShaderNoiseTexture(),
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies VoronoiUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: voronoiFragmentShader,
      uniforms,
    };
  }
);

export interface WarpProps extends ShaderComponentProps, WarpParams {}

const warpDefaultPreset: ShaderPreset<WarpParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    rotation: 0,
    speed: 1,
    frame: 0,
    colors: ['#121212', '#9470ff', '#121212', '#8838ff'],
    proportion: 0.45,
    softness: 1,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.1,
    shape: 'checks',
  },
};

const warpCauldronPreset: ShaderPreset<WarpParams> = {
  name: 'Cauldron Pot',
  params: {
    ...defaultPatternSizing,
    scale: 0.9,
    rotation: 160,
    speed: 10,
    frame: 0,
    colors: ['#a7e58b', '#324472', '#0a180d'],
    proportion: 0.64,
    softness: 1.5,
    distortion: 0.2,
    swirl: 0.86,
    swirlIterations: 7,
    shapeScale: 0.6,
    shape: 'edge',
  },
};

const warpInkPreset: ShaderPreset<WarpParams> = {
  name: 'Live Ink',
  params: {
    ...defaultPatternSizing,
    scale: 1.2,
    rotation: 44,
    offsetY: -0.3,
    speed: 2.5,
    frame: 0,
    colors: ['#111314', '#9faeab', '#f3fee7', '#f3fee7'],
    proportion: 0.05,
    softness: 0,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.28,
    shape: 'checks',
  },
};

const warpKelpPreset: ShaderPreset<WarpParams> = {
  name: 'Kelp',
  params: {
    ...defaultPatternSizing,
    scale: 0.8,
    rotation: 50,
    speed: 20,
    frame: 0,
    colors: ['#dbff8f', '#404f3e', '#091316'],
    proportion: 0.67,
    softness: 0,
    distortion: 0,
    swirl: 0.2,
    swirlIterations: 3,
    shapeScale: 1,
    shape: 'stripes',
  },
};

const warpNectarPreset: ShaderPreset<WarpParams> = {
  name: 'Nectar',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    offsetY: 0.6,
    rotation: 0,
    speed: 4.2,
    frame: 0,
    colors: ['#151310', '#d3a86b', '#f0edea'],
    proportion: 0.24,
    softness: 1,
    distortion: 0.21,
    swirl: 0.57,
    swirlIterations: 10,
    shapeScale: 0.75,
    shape: 'edge',
  },
};

const warpPassionPreset: ShaderPreset<WarpParams> = {
  name: 'Passion',
  params: {
    ...defaultPatternSizing,
    scale: 2.5,
    rotation: 1.35,
    speed: 3,
    frame: 0,
    colors: ['#3b1515', '#954751', '#ffc085'],
    proportion: 0.5,
    softness: 1,
    distortion: 0.09,
    swirl: 0.9,
    swirlIterations: 6,
    shapeScale: 0.25,
    shape: 'checks',
  },
};

export const warpPresets = [
  warpDefaultPreset,
  warpCauldronPreset,
  warpInkPreset,
  warpKelpPreset,
  warpNectarPreset,
  warpPassionPreset,
] satisfies ShaderPreset<WarpParams>[];

export const Warp = createShaderComponent<WarpProps>(
  'Warp',
  shaderComponentPropNames(warpDefaultPreset.params),
  ({
    speed = warpDefaultPreset.params.speed,
    frame = warpDefaultPreset.params.frame,
    colors = warpDefaultPreset.params.colors,
    proportion = warpDefaultPreset.params.proportion,
    softness = warpDefaultPreset.params.softness,
    distortion = warpDefaultPreset.params.distortion,
    swirl = warpDefaultPreset.params.swirl,
    swirlIterations = warpDefaultPreset.params.swirlIterations,
    shapeScale = warpDefaultPreset.params.shapeScale,
    shape = warpDefaultPreset.params.shape,
    fit = warpDefaultPreset.params.fit,
    scale = warpDefaultPreset.params.scale,
    rotation = warpDefaultPreset.params.rotation,
    originX = warpDefaultPreset.params.originX,
    originY = warpDefaultPreset.params.originY,
    offsetX = warpDefaultPreset.params.offsetX,
    offsetY = warpDefaultPreset.params.offsetY,
    worldWidth = warpDefaultPreset.params.worldWidth,
    worldHeight = warpDefaultPreset.params.worldHeight,
    ...props
  }: WarpProps) => {
    const uniforms = {
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_proportion: proportion,
      u_softness: softness,
      u_distortion: distortion,
      u_swirl: swirl,
      u_swirlIterations: swirlIterations,
      u_shapeScale: shapeScale,
      u_shape: WarpPatterns[shape],
      u_noiseTexture: getShaderNoiseTexture(),
      u_scale: scale,
      u_rotation: rotation,
      u_fit: ShaderFitOptions[fit],
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies WarpUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: warpFragmentShader,
      uniforms,
    };
  }
);

export interface GodRaysProps extends ShaderComponentProps, GodRaysParams {}

const godRaysDefaultPreset: ShaderPreset<GodRaysParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    offsetX: 0,
    offsetY: -0.55,
    colorBack: '#000000',
    colorBloom: '#0000ff',
    colors: ['#a600ff6e', '#6200fff0', '#ffffff', '#33fff5'],
    density: 0.3,
    spotty: 0.3,
    midIntensity: 0.4,
    midSize: 0.2,
    intensity: 0.8,
    bloom: 0.4,
    speed: 0.75,
    frame: 0,
  },
};

const godRaysWarpPreset: ShaderPreset<GodRaysParams> = {
  name: 'Warp',
  params: {
    ...defaultObjectSizing,
    colorBack: '#000000',
    colorBloom: '#222288',
    colors: ['#ff47d4', '#ff8c00', '#ffffff'],
    density: 0.45,
    spotty: 0.15,
    midIntensity: 0.4,
    midSize: 0.33,
    intensity: 0.79,
    bloom: 0.4,
    speed: 2,
    frame: 0,
  },
};

const godRaysLinearPreset: ShaderPreset<GodRaysParams> = {
  name: 'Linear',
  params: {
    ...defaultObjectSizing,
    offsetX: 0.2,
    offsetY: -0.8,
    colorBack: '#000000',
    colorBloom: '#eeeeee',
    colors: ['#ffffff1f', '#ffffff3d', '#ffffff29'],
    density: 0.41,
    spotty: 0.25,
    midSize: 0.1,
    midIntensity: 0.75,
    intensity: 0.79,
    bloom: 1,
    speed: 0.5,
    frame: 0,
  },
};

const godRaysEtherPreset: ShaderPreset<GodRaysParams> = {
  name: 'Ether',
  params: {
    ...defaultObjectSizing,
    offsetX: -0.6,
    colorBack: '#090f1d',
    colorBloom: '#ffffff',
    colors: ['#148effa6', '#c4dffebe', '#232a47'],
    density: 0.03,
    spotty: 0.77,
    midSize: 0.1,
    midIntensity: 0.6,
    intensity: 0.6,
    bloom: 0.6,
    speed: 1,
    frame: 0,
  },
};

export const godRaysPresets = [
  godRaysDefaultPreset,
  godRaysWarpPreset,
  godRaysLinearPreset,
  godRaysEtherPreset,
] satisfies ShaderPreset<GodRaysParams>[];

export const GodRays = createShaderComponent<GodRaysProps>(
  'GodRays',
  shaderComponentPropNames(godRaysDefaultPreset.params),
  ({
    speed = godRaysDefaultPreset.params.speed,
    frame = godRaysDefaultPreset.params.frame,
    colorBloom = godRaysDefaultPreset.params.colorBloom,
    colorBack = godRaysDefaultPreset.params.colorBack,
    colors = godRaysDefaultPreset.params.colors,
    density = godRaysDefaultPreset.params.density,
    spotty = godRaysDefaultPreset.params.spotty,
    midIntensity = godRaysDefaultPreset.params.midIntensity,
    midSize = godRaysDefaultPreset.params.midSize,
    intensity = godRaysDefaultPreset.params.intensity,
    bloom = godRaysDefaultPreset.params.bloom,
    fit = godRaysDefaultPreset.params.fit,
    scale = godRaysDefaultPreset.params.scale,
    rotation = godRaysDefaultPreset.params.rotation,
    originX = godRaysDefaultPreset.params.originX,
    originY = godRaysDefaultPreset.params.originY,
    offsetX = godRaysDefaultPreset.params.offsetX,
    offsetY = godRaysDefaultPreset.params.offsetY,
    worldWidth = godRaysDefaultPreset.params.worldWidth,
    worldHeight = godRaysDefaultPreset.params.worldHeight,
    ...props
  }: GodRaysProps) => {
    const uniforms = {
      u_colorBloom: getShaderColorFromString(colorBloom),
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_density: density,
      u_spotty: spotty,
      u_midIntensity: midIntensity,
      u_midSize: midSize,
      u_intensity: intensity,
      u_bloom: bloom,
      u_noiseTexture: getShaderNoiseTexture(),
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies GodRaysUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: godRaysFragmentShader,
      uniforms,
    };
  }
);

export interface SpiralProps extends ShaderComponentProps, SpiralParams {}

const spiralDefaultPreset: ShaderPreset<SpiralParams> = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    scale: 1,
    colorBack: '#001429',
    colorFront: '#79D1FF',
    density: 1,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noise: 0,
    noiseFrequency: 0,
    softness: 0,
    speed: 1,
    frame: 0,
  },
};

const spiralDropletPreset: ShaderPreset<SpiralParams> = {
  name: 'Droplet',
  params: {
    ...defaultPatternSizing,
    colorBack: '#effafe',
    colorFront: '#bf40a0',
    density: 0.9,
    distortion: 0,
    strokeWidth: 0.75,
    strokeTaper: 0.18,
    strokeCap: 1,
    noise: 0.74,
    noiseFrequency: 0.33,
    softness: 0.02,
    speed: 1,
    frame: 0,
  },
};

const spiralJunglePreset: ShaderPreset<SpiralParams> = {
  name: 'Jungle',
  params: {
    ...defaultPatternSizing,
    scale: 1.3,
    density: 0.5,
    colorBack: '#a0ef2a',
    colorFront: '#288b18',
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noise: 1,
    noiseFrequency: 0.25,
    softness: 0,
    speed: 0.75,
    frame: 0,
  },
};

const spiralSwirlPreset: ShaderPreset<SpiralParams> = {
  name: 'Swirl',
  params: {
    ...defaultPatternSizing,
    scale: 0.45,
    colorBack: '#b3e6d9',
    colorFront: '#1a2b4d',
    density: 0.2,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noise: 0,
    noiseFrequency: 0.3,
    softness: 0.5,
    speed: 1,
    frame: 0,
  },
};

export const spiralPresets = [
  spiralDefaultPreset,
  spiralJunglePreset,
  spiralDropletPreset,
  spiralSwirlPreset,
] satisfies ShaderPreset<SpiralParams>[];

export const Spiral = createShaderComponent<SpiralProps>(
  'Spiral',
  shaderComponentPropNames(spiralDefaultPreset.params),
  ({
    speed = spiralDefaultPreset.params.speed,
    frame = spiralDefaultPreset.params.frame,
    colorBack = spiralDefaultPreset.params.colorBack,
    colorFront = spiralDefaultPreset.params.colorFront,
    density = spiralDefaultPreset.params.density,
    distortion = spiralDefaultPreset.params.distortion,
    strokeWidth = spiralDefaultPreset.params.strokeWidth,
    strokeTaper = spiralDefaultPreset.params.strokeTaper,
    strokeCap = spiralDefaultPreset.params.strokeCap,
    noiseFrequency = spiralDefaultPreset.params.noiseFrequency,
    noise = spiralDefaultPreset.params.noise,
    softness = spiralDefaultPreset.params.softness,
    fit = spiralDefaultPreset.params.fit,
    rotation = spiralDefaultPreset.params.rotation,
    scale = spiralDefaultPreset.params.scale,
    originX = spiralDefaultPreset.params.originX,
    originY = spiralDefaultPreset.params.originY,
    offsetX = spiralDefaultPreset.params.offsetX,
    offsetY = spiralDefaultPreset.params.offsetY,
    worldWidth = spiralDefaultPreset.params.worldWidth,
    worldHeight = spiralDefaultPreset.params.worldHeight,
    ...props
  }: SpiralProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colorFront: getShaderColorFromString(colorFront),
      u_density: density,
      u_distortion: distortion,
      u_strokeWidth: strokeWidth,
      u_strokeTaper: strokeTaper,
      u_strokeCap: strokeCap,
      u_noiseFrequency: noiseFrequency,
      u_noise: noise,
      u_softness: softness,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies SpiralUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: spiralFragmentShader,
      uniforms,
    };
  }
);

export interface SwirlProps extends ShaderComponentProps, SwirlParams {}

const swirlDefaultPreset: ShaderPreset<SwirlParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 0.32,
    frame: 0,
    colorBack: '#330000',
    colors: ['#ffd1d1', '#ff8a8a', '#660000'],
    bandCount: 4,
    twist: 0.1,
    center: 0.2,
    proportion: 0.5,
    softness: 0,
    noiseFrequency: 0.4,
    noise: 0.2,
  },
};

const swirlOpeningPreset: ShaderPreset<SwirlParams> = {
  name: 'Opening',
  params: {
    ...defaultObjectSizing,
    offsetX: -0.4,
    offsetY: 1,
    speed: 0.5,
    frame: 0,
    colorBack: '#ff8b61',
    colors: ['#fefff0', '#ffd8bd', '#ff8b61'],
    bandCount: 2,
    twist: 0.3,
    center: 0.2,
    proportion: 0.5,
    softness: 0,
    noiseFrequency: 0,
    noise: 0,
    scale: 1,
  },
};

const swirlJamesBondPreset: ShaderPreset<SwirlParams> = {
  name: '007',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#E9E7DA',
    colors: ['#000000'],
    bandCount: 5,
    twist: 0.3,
    center: 0,
    proportion: 0,
    softness: 0,
    noiseFrequency: 0.5,
    noise: 0,
  },
};

const swirlCandyPreset: ShaderPreset<SwirlParams> = {
  name: 'Candy',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#ffcd66',
    colors: ['#6bbceb', '#d7b3ff', '#ff9fff'],
    bandCount: 2,
    twist: 0.15,
    center: 0.2,
    proportion: 0.5,
    softness: 1,
    noiseFrequency: 0.5,
    noise: 0,
  },
};

export const swirlPresets = [
  swirlDefaultPreset,
  swirlJamesBondPreset,
  swirlOpeningPreset,
  swirlCandyPreset,
] satisfies ShaderPreset<SwirlParams>[];

export const Swirl = createShaderComponent<SwirlProps>(
  'Swirl',
  shaderComponentPropNames(swirlDefaultPreset.params),
  ({
    speed = swirlDefaultPreset.params.speed,
    frame = swirlDefaultPreset.params.frame,
    colorBack = swirlDefaultPreset.params.colorBack,
    colors = swirlDefaultPreset.params.colors,
    bandCount = swirlDefaultPreset.params.bandCount,
    twist = swirlDefaultPreset.params.twist,
    center = swirlDefaultPreset.params.center,
    proportion = swirlDefaultPreset.params.proportion,
    softness = swirlDefaultPreset.params.softness,
    noiseFrequency = swirlDefaultPreset.params.noiseFrequency,
    noise = swirlDefaultPreset.params.noise,
    fit = swirlDefaultPreset.params.fit,
    rotation = swirlDefaultPreset.params.rotation,
    scale = swirlDefaultPreset.params.scale,
    originX = swirlDefaultPreset.params.originX,
    originY = swirlDefaultPreset.params.originY,
    offsetX = swirlDefaultPreset.params.offsetX,
    offsetY = swirlDefaultPreset.params.offsetY,
    worldWidth = swirlDefaultPreset.params.worldWidth,
    worldHeight = swirlDefaultPreset.params.worldHeight,
    ...props
  }: SwirlProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_bandCount: bandCount,
      u_twist: twist,
      u_center: center,
      u_proportion: proportion,
      u_softness: softness,
      u_noiseFrequency: noiseFrequency,
      u_noise: noise,
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies SwirlUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: swirlFragmentShader,
      uniforms,
    };
  }
);

export interface GrainGradientProps extends ShaderComponentProps, GrainGradientParams {}

const grainGradientDefaultPreset: ShaderPreset<GrainGradientParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#7300ff', '#eba8ff', '#00bfff', '#2a00ff'],
    softness: 0.5,
    intensity: 0.5,
    noise: 0.25,
    shape: 'corners',
  },
};

const grainGradientWavePreset: ShaderPreset<GrainGradientParams> = {
  name: 'Wave',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000a0f',
    colors: ['#c4730b', '#bdad5f', '#d8ccc7'],
    softness: 0.7,
    intensity: 0.15,
    noise: 0.5,
    shape: 'wave',
  },
};

const grainGradientDotsPreset: ShaderPreset<GrainGradientParams> = {
  name: 'Dots',
  params: {
    ...defaultPatternSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#0a0000',
    colors: ['#6f0000', '#0080ff', '#f2ebc9', '#33cc33'],
    softness: 1,
    intensity: 1,
    noise: 0.7,
    shape: 'dots',
  },
};

const grainGradientTruchetPreset: ShaderPreset<GrainGradientParams> = {
  name: 'Truchet',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: '#0a0000',
    colors: ['#6f2200', '#eabb7c', '#39b523'],
    softness: 0,
    intensity: 0.2,
    noise: 1,
    shape: 'truchet',
  },
};

const grainGradientRipplePreset: ShaderPreset<GrainGradientParams> = {
  name: 'Ripple',
  params: {
    ...defaultObjectSizing,
    scale: 0.5,
    speed: 1,
    frame: 0,
    colorBack: '#140a00',
    colors: ['#6f2d00', '#88ddae', '#2c0b1d'],
    softness: 0.5,
    intensity: 0.5,
    noise: 0.5,
    shape: 'ripple',
  },
};

const grainGradientBlobPreset: ShaderPreset<GrainGradientParams> = {
  name: 'Blob',
  params: {
    ...defaultObjectSizing,
    scale: 1.3,
    speed: 1,
    frame: 0,
    colorBack: '#0f0e18',
    colors: ['#3e6172', '#a49b74', '#568c50'],
    softness: 0,
    intensity: 0.15,
    noise: 0.5,
    shape: 'blob',
  },
};

export const grainGradientPresets = [
  grainGradientDefaultPreset,
  grainGradientWavePreset,
  grainGradientDotsPreset,
  grainGradientTruchetPreset,
  grainGradientRipplePreset,
  grainGradientBlobPreset,
] satisfies ShaderPreset<GrainGradientParams>[];

export const GrainGradient = createShaderComponent<GrainGradientProps>(
  'GrainGradient',
  shaderComponentPropNames(grainGradientDefaultPreset.params),
  ({
    speed = grainGradientDefaultPreset.params.speed,
    frame = grainGradientDefaultPreset.params.frame,
    colorBack = grainGradientDefaultPreset.params.colorBack,
    colors = grainGradientDefaultPreset.params.colors,
    softness = grainGradientDefaultPreset.params.softness,
    intensity = grainGradientDefaultPreset.params.intensity,
    noise = grainGradientDefaultPreset.params.noise,
    shape = grainGradientDefaultPreset.params.shape,
    fit = grainGradientDefaultPreset.params.fit,
    scale = grainGradientDefaultPreset.params.scale,
    rotation = grainGradientDefaultPreset.params.rotation,
    originX = grainGradientDefaultPreset.params.originX,
    originY = grainGradientDefaultPreset.params.originY,
    offsetX = grainGradientDefaultPreset.params.offsetX,
    offsetY = grainGradientDefaultPreset.params.offsetY,
    worldWidth = grainGradientDefaultPreset.params.worldWidth,
    worldHeight = grainGradientDefaultPreset.params.worldHeight,
    ...props
  }: GrainGradientProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_softness: softness,
      u_intensity: intensity,
      u_noise: noise,
      u_shape: GrainGradientShapes[shape],
      u_noiseTexture: getShaderNoiseTexture(),
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_rotation: rotation,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies GrainGradientUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: grainGradientFragmentShader,
      uniforms,
    };
  }
);

export interface PulsingBorderProps extends ShaderComponentProps, PulsingBorderParams {}

const pulsingBorderDefaultPreset: ShaderPreset<PulsingBorderParams> = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    scale: 0.6,
    colorBack: '#000000',
    colors: ['#0dc1fd', '#d915ef', '#ff3f2ecc'],
    roundness: 0.25,
    thickness: 0.1,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    aspectRatio: 'auto',
    softness: 0.75,
    intensity: 0.2,
    bloom: 0.25,
    spots: 5,
    spotSize: 0.5,
    pulse: 0.25,
    smoke: 0.3,
    smokeSize: 0.6,
  },
};

const pulsingBorderCirclePreset: ShaderPreset<PulsingBorderParams> = {
  name: 'Circle',
  params: {
    ...defaultObjectSizing,
    aspectRatio: 'square',
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#0dc1fd', '#d915ef', '#ff3f2ecc'],
    roundness: 1,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    thickness: 0,
    softness: 0.75,
    intensity: 0.2,
    bloom: 0.45,
    spots: 3,
    spotSize: 0.4,
    pulse: 0.5,
    smoke: 1,
    smokeSize: 0,
  },
};

const pulsingBorderNorthernLightsPreset: ShaderPreset<PulsingBorderParams> = {
  name: 'Northern lights',
  params: {
    ...defaultObjectSizing,
    speed: 0.18,
    scale: 1.1,
    frame: 0,
    colors: ['#4c4794', '#774a7d', '#12694a', '#0aff78', '#4733cc'],
    colorBack: '#0c182c',
    roundness: 0,
    thickness: 1,
    softness: 1,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    aspectRatio: 'auto',
    intensity: 0.1,
    bloom: 0.2,
    spots: 4,
    spotSize: 0.25,
    pulse: 0,
    smoke: 0.32,
    smokeSize: 0.5,
  },
};

const pulsingBorderSolidLinePreset: ShaderPreset<PulsingBorderParams> = {
  name: 'Solid line',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['#81ADEC'],
    colorBack: '#00000000',
    roundness: 0,
    thickness: 0.05,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    aspectRatio: 'auto',
    softness: 0,
    intensity: 0,
    bloom: 0.15,
    spots: 4,
    spotSize: 1,
    pulse: 0,
    smoke: 0,
    smokeSize: 0,
  },
};

export const pulsingBorderPresets = [
  pulsingBorderDefaultPreset,
  pulsingBorderCirclePreset,
  pulsingBorderNorthernLightsPreset,
  pulsingBorderSolidLinePreset,
] satisfies ShaderPreset<PulsingBorderParams>[];

export const PulsingBorder = createShaderComponent<PulsingBorderProps>(
  'PulsingBorder',
  shaderComponentPropNames(pulsingBorderDefaultPreset.params),
  ({
    speed = pulsingBorderDefaultPreset.params.speed,
    frame = pulsingBorderDefaultPreset.params.frame,
    colors = pulsingBorderDefaultPreset.params.colors,
    colorBack = pulsingBorderDefaultPreset.params.colorBack,
    roundness = pulsingBorderDefaultPreset.params.roundness,
    thickness = pulsingBorderDefaultPreset.params.thickness,
    aspectRatio = pulsingBorderDefaultPreset.params.aspectRatio,
    softness = pulsingBorderDefaultPreset.params.softness,
    bloom = pulsingBorderDefaultPreset.params.bloom,
    intensity = pulsingBorderDefaultPreset.params.intensity,
    spots = pulsingBorderDefaultPreset.params.spots,
    spotSize = pulsingBorderDefaultPreset.params.spotSize,
    pulse = pulsingBorderDefaultPreset.params.pulse,
    smoke = pulsingBorderDefaultPreset.params.smoke,
    smokeSize = pulsingBorderDefaultPreset.params.smokeSize,
    margin,
    marginLeft = margin ?? pulsingBorderDefaultPreset.params.marginLeft,
    marginRight = margin ?? pulsingBorderDefaultPreset.params.marginRight,
    marginTop = margin ?? pulsingBorderDefaultPreset.params.marginTop,
    marginBottom = margin ?? pulsingBorderDefaultPreset.params.marginBottom,
    fit = pulsingBorderDefaultPreset.params.fit,
    rotation = pulsingBorderDefaultPreset.params.rotation,
    scale = pulsingBorderDefaultPreset.params.scale,
    originX = pulsingBorderDefaultPreset.params.originX,
    originY = pulsingBorderDefaultPreset.params.originY,
    offsetX = pulsingBorderDefaultPreset.params.offsetX,
    offsetY = pulsingBorderDefaultPreset.params.offsetY,
    worldWidth = pulsingBorderDefaultPreset.params.worldWidth,
    worldHeight = pulsingBorderDefaultPreset.params.worldHeight,
    ...props
  }: PulsingBorderProps) => {
    const uniforms = {
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,
      u_roundness: roundness,
      u_thickness: thickness,
      u_marginLeft: marginLeft,
      u_marginRight: marginRight,
      u_marginTop: marginTop,
      u_marginBottom: marginBottom,
      u_aspectRatio: PulsingBorderAspectRatios[aspectRatio],
      u_softness: softness,
      u_intensity: intensity,
      u_bloom: bloom,
      u_spots: spots,
      u_spotSize: spotSize,
      u_pulse: pulse,
      u_smoke: smoke,
      u_smokeSize: smokeSize,
      u_noiseTexture: getShaderNoiseTexture(),
      u_fit: ShaderFitOptions[fit],
      u_rotation: rotation,
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies PulsingBorderUniforms;

    return {
      ...props,
      speed,
      frame,
      fragmentShader: pulsingBorderFragmentShader,
      uniforms,
    };
  }
);
