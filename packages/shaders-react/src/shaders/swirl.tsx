import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  ShaderFitOptions,
  swirlFragmentShader,
  type ShaderPreset,
  type SwirlParams,
  type SwirlUniforms,
} from '@paper-design/shaders';
import { colorPropsAreEqual } from '../color-props-are-equal.js';

export interface SwirlProps extends ShaderComponentProps, SwirlParams {}

type SwirlPreset = ShaderPreset<SwirlParams>;

export const defaultPreset: SwirlPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 2.28,
    offsetX: -0.4,
    offsetY: 0.3,
    speed: 0.32,
    frame: 0,
    colorBack: '#452424',
    colors: ['#0b7f05', '#ffe785', '#ff335c'],
    bandCount: 5,
    twist: 0.11,
    softness: 0,
    noiseFrequency: 1.2,
    noisePower: 0.46,
  },
};

export const openingPreset: SwirlPreset = {
  name: 'Opening',
  params: {
    ...defaultObjectSizing,
    offsetX: -0.4,
    offsetY: 0.86,
    speed: 0.6,
    frame: 0,
    colorBack: '#8b2e5f',
    colors: ['#b14467', '#e67a62', '#ffbdb3'],
    bandCount: 3,
    twist: 0.3,
    softness: 0,
    noiseFrequency: 2,
    noisePower: 0,
  },
} as const;

export const jamesBondPreset: SwirlPreset = {
  name: '007',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#2e2e2e', '#000000', '#ffffff'],
    bandCount: 4,
    twist: 0.4,
    softness: 0,
    noiseFrequency: 0,
    noisePower: 0,
  },
} as const;

export const candyPreset: SwirlPreset = {
  name: 'Candy',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#ffcd66',
    colors: ['#6bbceb', '#8a1fff', '#ff9fff'],
    bandCount: 2.5,
    twist: 0.2,
    softness: 1,
    noiseFrequency: 0,
    noisePower: 0,
  },
} as const;

export const swirlPresets: SwirlPreset[] = [defaultPreset, openingPreset, jamesBondPreset, candyPreset];

export const Swirl: React.FC<SwirlProps> = memo(function SwirlImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  bandCount = defaultPreset.params.bandCount,
  twist = defaultPreset.params.twist,
  softness = defaultPreset.params.softness,
  noiseFrequency = defaultPreset.params.noiseFrequency,
  noisePower = defaultPreset.params.noisePower,

  // Sizing props
  fit = defaultPreset.params.fit,
  rotation = defaultPreset.params.rotation,
  scale = defaultPreset.params.scale,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: SwirlProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_bandCount: bandCount,
    u_twist: twist,
    u_softness: softness,
    u_noiseFrequency: noiseFrequency,
    u_noisePower: noisePower,

    // Sizing uniforms
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

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={swirlFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
