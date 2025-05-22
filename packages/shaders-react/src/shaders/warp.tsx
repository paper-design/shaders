import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  warpFragmentShader,
  ShaderFitOptions,
  type WarpParams,
  type WarpUniforms,
  type ShaderPreset,
  WarpPatterns,
} from '@paper-design/shaders';

export interface WarpProps extends ShaderComponentProps, WarpParams {}

type WarpPreset = ShaderPreset<WarpParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: WarpPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    rotation: 0,
    speed: 1,
    frame: 0,
    colors: ['#262626', '#75c1f0', '#ffffff'],
    proportion: 0.35,
    softness: 1,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.1,
    shape: 'checks',
  },
};

export const presetAbyss: WarpPreset = {
  name: 'The Abyss',
  params: {
    ...defaultPatternSizing,
    scale: 3,
    rotation: 2,
    speed: 0.6,
    frame: 0,
    colors: ['#15122e', '#7b89f2', '#ffffff'],
    proportion: 0,
    softness: 1,
    distortion: 0.09,
    swirl: 0.48,
    swirlIterations: 5,
    shapeScale: 0.85,
    shape: 'edge',
  },
};

export const presetCauldron: WarpPreset = {
  name: 'Cauldron Pot',
  params: {
    ...defaultPatternSizing,
    scale: 0.9,
    rotation: 160,
    speed: 20,
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

export const presetFilteredLight: WarpPreset = {
  name: 'Filtered Light',
  params: {
    ...defaultPatternSizing,
    scale: 0.3,
    rotation: 45,
    speed: 3.2,
    frame: 0,
    colors: ['#171714', '#d4d8be', '#f9f9e0'],
    proportion: 0.4,
    softness: 1,
    distortion: 0.09,
    swirl: 0.1,
    swirlIterations: 0,
    shapeScale: 0.1,
    shape: 'stripes',
  },
};

export const presetIceberg: WarpPreset = {
  name: 'Iceberg',
  params: {
    ...defaultPatternSizing,
    scale: 0.8,
    rotation: 190,
    offsetX: 0.3,
    speed: 0.5,
    frame: 0,
    colors: ['#ffffff', '#324771', '#0a180d'],
    proportion: 0.3,
    softness: 1.2,
    distortion: 0.2,
    swirl: 0.86,
    swirlIterations: 7,
    shapeScale: 0,
    shape: 'checks',
  },
};

export const presetInk: WarpPreset = {
  name: 'Live Ink',
  params: {
    ...defaultPatternSizing,
    scale: 1.2,
    rotation: 44,
    offsetY: -0.3,
    speed: 10,
    frame: 0,
    colors: ['#111314', '#9faeab', '#f3fee7'],
    proportion: 0.35,
    softness: 0,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.28,
    shape: 'checks',
  },
};

export const presetKelp: WarpPreset = {
  name: 'Kelp',
  params: {
    ...defaultPatternSizing,
    scale: 0.88,
    rotation: 50,
    speed: 80,
    frame: 0,
    colors: ['#dbff8f', '#404f3e', '#091316'],
    proportion: 0.93,
    softness: 0.05,
    distortion: 0,
    swirl: 0.15,
    swirlIterations: 0,
    shapeScale: 0.74,
    shape: 'stripes',
  },
};

export const presetNectar: WarpPreset = {
  name: 'Nectar',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    offsetY: 0.6,
    rotation: 0,
    speed: 30,
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

export const presetPassion: WarpPreset = {
  name: 'Passion',
  params: {
    ...defaultPatternSizing,
    scale: 2.5,
    rotation: 1.35,
    speed: 15,
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

export const presetPhantom: WarpPreset = {
  name: 'Phantom',
  params: {
    ...defaultPatternSizing,
    scale: 1.2,
    rotation: 180,
    offsetY: -0.2,
    speed: 30,
    frame: 0,
    colors: ['#12112c', '#7b89f2', '#d7dcfb'],
    proportion: 0.5,
    softness: 1,
    distortion: 0.2,
    swirl: 0.3,
    swirlIterations: 7,
    shapeScale: 0.1,
    shape: 'checks',
  },
};

export const presetSilk: WarpPreset = {
  name: 'Silk',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    rotation: 0,
    speed: 5,
    frame: 0,
    colors: ['#141111', '#665551', '#baaea9'],
    proportion: 0,
    softness: 1,
    distortion: 0.3,
    swirl: 0.6,
    swirlIterations: 11,
    shapeScale: 0.25,
    shape: 'stripes',
  },
};

export const warpPresets: WarpPreset[] = [
  defaultPreset,
  presetAbyss,
  presetCauldron,
  presetFilteredLight,
  presetIceberg,
  presetInk,
  presetKelp,
  presetNectar,
  presetPassion,
  presetPhantom,
  presetSilk,
];

export const Warp: React.FC<WarpProps> = memo(function WarpImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  proportion = defaultPreset.params.proportion,
  softness = defaultPreset.params.softness,
  distortion = defaultPreset.params.distortion,
  swirl = defaultPreset.params.swirl,
  swirlIterations = defaultPreset.params.swirlIterations,
  shapeScale = defaultPreset.params.shapeScale,
  shape = defaultPreset.params.shape,

  // Sizing props
  fit = defaultPreset.params.fit,
  scale = defaultPreset.params.scale,
  rotation = defaultPreset.params.rotation,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: WarpProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_proportion: proportion,
    u_softness: softness,
    u_distortion: distortion,
    u_swirl: swirl,
    u_swirlIterations: swirlIterations,
    u_shapeScale: shapeScale,
    u_shape: WarpPatterns[shape],

    // Sizing uniforms
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

  return <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={warpFragmentShader} uniforms={uniforms} />;
}, colorPropsAreEqual);
