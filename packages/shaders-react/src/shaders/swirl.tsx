import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  ShaderFitOptions,
  swirlFragmentShader,
  type ShaderPreset,
  type SwirlParams,
  type SwirlUniforms,
} from '@paper-design/shaders';
import { colorPropsAreEqual } from '../color-props-are-equal';

export interface SwirlProps extends ShaderComponentProps, SwirlParams {}

type SwirlPreset = ShaderPreset<SwirlParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highmidIntensity bug)

export const defaultPreset: SwirlPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 2.28,
    offsetX: -0.4,
    offsetY: 0.3,
    speed: 0.32,
    frame: 0,
    colors: [
      'hsla(0, 29%, 20%, 1)',
      'hsla(105, 93%, 27%, 1)',
      'hsla(43, 100%, 76%, 1)',
      'hsla(351, 100%, 60%, 1)',
    ],
    bandCount: 5,
    twist: 0.11,
    softness: 0.01,
    noiseFreq: 1.2,
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
    colors: [
      'hsla(330, 49%, 36%, 1)',
      'hsla(336, 47%, 50%, 1)',
      'hsla(6, 72%, 66%, 1)',
      'hsla(20, 100%, 68%, 1)',
      'hsla(45, 100%, 68%, 1)',
      'hsla(60, 94%, 75%, 1)',
    ],
    bandCount: 3,
    twist: 0.3,
    softness: 0,
    noiseFreq: 2,
    noisePower: 0,
  },
} as const;

export const jamesBondPreset: SwirlPreset = {
  name: '007',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['hsla(0, 0%, 0%, 1)', 'hsla(0, 0%, 18%, 1)', 'hsla(0, 0%, 0%, 1)', 'hsla(0, 0%, 100%, 1)'],
    bandCount: 4,
    twist: 0.4,
    softness: 0,
    noiseFreq: 0,
    noisePower: 0,
  },
} as const;

export const candyPreset: SwirlPreset = {
  name: 'Candy',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['hsla(45, 100%, 70%, 1)', 'hsla(200, 80%, 65%, 1)', 'hsla(280, 90%, 60%, 1)'],
    bandCount: 2.5,
    twist: 0.2,
    softness: 1,
    noiseFreq: 0,
    noisePower: 0,
  },
} as const;

export const swirlPresets: SwirlPreset[] = [defaultPreset, openingPreset, jamesBondPreset, candyPreset];

export const Swirl: React.FC<SwirlProps> = memo(function SwirlImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  bandCount = defaultPreset.params.bandCount,
  twist = defaultPreset.params.twist,
  softness = defaultPreset.params.softness,
  noiseFreq = defaultPreset.params.noiseFreq,
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
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_bandCount: bandCount,
    u_twist: twist,
    u_softness: softness,
    u_noiseFreq: noiseFreq,
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
