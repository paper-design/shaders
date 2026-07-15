import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  prismFragmentShader,
  ShaderFitOptions,
  type PrismUniforms,
  type PrismParams,
  defaultObjectSizing,
  type ImageShaderPreset,
} from '@paper-design/shaders';

export interface PrismProps extends ShaderComponentProps, PrismParams {}

type PrismPreset = ImageShaderPreset<PrismParams>;

export const defaultPreset: PrismPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorSteps: 3,
    hue: 180,
    shift: 0.15,
    shiftBias: 0,
  },
} as const;

export const fadedPreset: PrismPreset = {
  name: 'Faded',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorSteps: 3,
    hue: 0,
    shift: 0.15,
    shiftBias: 0,
  },
} as const;

export const duotonePreset: PrismPreset = {
  name: 'Duotone',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorSteps: 2,
    hue: 192,
    shift: 0.2,
    shiftBias: 0,
  },
} as const;

export const spectrumPreset: PrismPreset = {
  name: 'Spectrum',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorSteps: 8,
    hue: 0,
    shift: 0.25,
    shiftBias: -0.6,
  },
} as const;

export const prismPresets: PrismPreset[] = [defaultPreset, fadedPreset, duotonePreset, spectrumPreset];

export const Prism: React.FC<PrismProps> = memo(function PrismImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  colorSteps = defaultPreset.params.colorSteps,
  hue = defaultPreset.params.hue,
  shift = defaultPreset.params.shift,
  shiftBias = defaultPreset.params.shiftBias,

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
}: PrismProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorSteps: colorSteps,
    u_hue: hue,
    u_shift: shift,
    u_shiftBias: shiftBias,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_rotation: rotation,
    u_scale: scale,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies PrismUniforms;

  return <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={prismFragmentShader} uniforms={uniforms} />;
});
