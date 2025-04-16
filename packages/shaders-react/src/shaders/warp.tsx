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
    speed: 0.1,
    frame: 0,
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(203, 80%, 70%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    proportion: 0.35,
    softness: 1,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.1,
    shape: 'checks',
  },
};

export const presetCauldron: WarpPreset = {
  name: 'Cauldron Pot',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 1.1,
    rotation: 1.62,
    speed: 1,
    frame: 0,
    color1: 'hsla(100, 51%, 75%, 1)',
    color2: 'hsla(220, 39%, 32%, 1)',
    color3: 'hsla(129.2, 41.9%, 6.1%, 1)',
    proportion: 0.64,
    softness: 0.95,
    distortion: 0.2,
    swirl: 0.86,
    swirlIterations: 7,
    shapeScale: 0,
    shape: 'edge',
  },
};

export const presetSilk: WarpPreset = {
  name: 'Silk',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.26,
    rotation: 0,
    speed: 0.5,
    frame: 0,
    color1: 'hsla(0, 9%, 7%, 1)',
    color2: 'hsla(8, 13%, 34%, 1)',
    color3: 'hsla(5, 8%, 71%, 1)',
    proportion: 0,
    softness: 1,
    distortion: 0.3,
    swirl: 0.6,
    swirlIterations: 11,
    shapeScale: 0.05,
    shape: 'stripes',
  },
};

export const presetPassion: WarpPreset = {
  name: 'Passion',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.25,
    rotation: 1.35,
    speed: 0.3,
    frame: 0,
    color1: 'hsla(0, 44.7%, 14.9%, 1)',
    color2: 'hsla(353.4, 34%, 42.2%, 1)',
    color3: 'hsla(29, 100%, 76.1%, 1)',
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
    scale: 1 / 0.68,
    rotation: 1.8,
    speed: 1.25,
    frame: 0,
    color1: 'hsla(242.2, 44.3%, 12%, 1)',
    color2: 'hsla(236.1, 80.4%, 70%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    proportion: 0.45,
    softness: 1,
    distortion: 0.16,
    swirl: 0.3,
    swirlIterations: 7,
    shapeScale: 0.1,
    shape: 'checks',
  },
};

export const presetAbyss: WarpPreset = {
  name: 'The Abyss',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.1,
    rotation: 2,
    speed: 0.06,
    frame: 0,
    color1: 'hsla(242.2, 44.3%, 12%, 1)',
    color2: 'hsla(236.1, 80.4%, 70%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    proportion: 0,
    softness: 1,
    distortion: 0.09,
    swirl: 0.48,
    swirlIterations: 4,
    shapeScale: 0.1,
    shape: 'edge',
  },
};

export const presetInk: WarpPreset = {
  name: 'Live Ink',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.7,
    rotation: 1.5,
    speed: 0.25,
    frame: 0,
    color1: 'hsla(210, 11.1%, 7.1%, 1)',
    color2: 'hsla(165, 9%, 65.1%, 1)',
    color3: 'hsla(84, 100%, 97.1%, 1)',
    proportion: 0.35,
    softness: 0,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.26,
    shape: 'checks',
  },
};

export const presetIceberg: WarpPreset = {
  name: 'Iceberg',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 1.1,
    rotation: 2,
    speed: 0.05,
    frame: 0,
    color1: 'hsla(0, 0%, 100%, 1)',
    color2: 'hsla(220, 38.7%, 32%, 1)',
    color3: 'hsla(129.2, 41.9%, 6.1%, 1)',
    proportion: 0.3,
    softness: 1,
    distortion: 0.2,
    swirl: 0.86,
    swirlIterations: 7,
    shapeScale: 0,
    shape: 'checks',
  },
};

export const presetNectar: WarpPreset = {
  name: 'Nectar',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.24,
    rotation: 0,
    speed: 0.42,
    frame: 0,
    color1: 'hsla(37.5, 22.2%, 7.1%, 1)',
    color2: 'hsla(38.5, 59.1%, 63.1%, 1)',
    color3: 'hsla(37.6, 30%, 95.2%, 1)',
    proportion: 0.24,
    softness: 1,
    distortion: 0.21,
    swirl: 0.57,
    swirlIterations: 10,
    shapeScale: 0.32,
    shape: 'edge',
  },
};

export const presetFilteredLight: WarpPreset = {
  name: 'Filtered Light',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    rotation: 0.44,
    speed: 0.32,
    frame: 0,
    color1: 'hsla(60.2, 7.8%, 8.3%, 1)',
    color2: 'hsla(64.4, 27.8%, 81%, 1)',
    color3: 'hsla(60, 100%, 93.9%, 1)',
    proportion: 0.25,
    softness: 1,
    distortion: 0.06,
    swirl: 0,
    swirlIterations: 0,
    shapeScale: 0,
    shape: 'stripes',
  },
};

export const presetKelp: WarpPreset = {
  name: 'Kelp',
  params: {
    ...defaultPatternSizing,
    scale: 0.38,
    rotation: 0.6,
    speed: 2,
    frame: 0,
    color1: 'hsla(79.3, 100%, 78%, 1)',
    color2: 'hsla(112, 10.5%, 28%, 1)',
    color3: 'hsla(203.3, 50%, 7.1%, 1)',
    proportion: 1,
    softness: 0,
    distortion: 0,
    swirl: 0.15,
    swirlIterations: 0,
    shapeScale: 0.74,
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
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  color3 = defaultPreset.params.color3,
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
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_color3: getShaderColorFromString(color3),
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
