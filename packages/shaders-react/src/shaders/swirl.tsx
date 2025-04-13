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

export interface SwirlProps extends ShaderComponentProps, SwirlParams {}

type SwirlPreset = ShaderPreset<SwirlParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highmidIntensity bug)

export const defaultPreset: SwirlPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    color1: 'hsla(45, 100%, 80%, 1)',
    color2: 'hsla(15, 100%, 50%, 1)',
    color3: 'hsla(30, 100%, 65%, 1)',
    bandCount: 4,
    twist: 0.2,
  },
};

export const openingPreset: SwirlPreset = {
  name: 'Opening',
  params: {
    ...defaultObjectSizing,
    offsetX: -0.4,
    offsetY: 0.5,
    speed: 1,
    frame: 0,
    color1: 'hsla(225, 60%, 27%, 1)',
    color2: 'hsla(308, 40%, 36%, 1)',
    color3: 'hsla(340, 55%, 55%, 1)',
    bandCount: 8,
    twist: 0.6,
  },
} as const;

export const jamesBondPreset: SwirlPreset = {
  name: '007',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    color1: 'hsla(0, 0%, 100%, 1)',
    color2: 'hsla(0, 0%, 15%, 1)',
    color3: 'hsla(0, 0%, 0%, 1)',
    bandCount: 8,
    twist: 0.5,
  },
} as const;

export const hippiePreset: SwirlPreset = {
  name: 'Hippie',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    color1: 'hsla(45, 100%, 70%, 1)',
    color2: 'hsla(200, 80%, 65%, 1)',
    color3: 'hsla(280, 90%, 60%, 1)',
    bandCount: 2.5,
    twist: 0.2,
  },
} as const;

export const swirlPresets: SwirlPreset[] = [defaultPreset, openingPreset, jamesBondPreset, hippiePreset];

export const Swirl: React.FC<SwirlProps> = memo(function SwirlImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  color3 = defaultPreset.params.color3,
  bandCount = defaultPreset.params.bandCount,
  twist = defaultPreset.params.twist,

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
}) {
  const uniforms = {
    // Own uniforms
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_color3: getShaderColorFromString(color3),
    u_bandCount: bandCount,
    u_twist: twist,

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
});
