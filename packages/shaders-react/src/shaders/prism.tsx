import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
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
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    samples: 24,
    spectrum: 0.53,
    hue: 116,
    shift: 0.55,
    shiftAngle: 360,
    perspective: 0.47,
    focusCenter: 0.34,
    focusEdges: 0.89,
    shiftBias: 0.74,
    noise: 0,
    noiseFrequency: 4,
    noiseOffset: 0,
    lensBulge: 0,
    lensRound: 0,
    debugCircle: false,
  },
} as const;

export const fisheyePreset: PrismPreset = {
  name: 'Fisheye',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    samples: 50,
    spectrum: 0.41,
    hue: 360,
    shift: 0.7,
    shiftAngle: 0,
    perspective: 1,
    focusCenter: 0.9,
    focusEdges: 1,
    shiftBias: 0.15,
    noise: 0,
    noiseFrequency: 4,
    noiseOffset: 0,
    lensBulge: 0.9,
    lensRound: 1,
    debugCircle: false,
  },
} as const;

export const duotonePreset: PrismPreset = {
  name: 'Duotone',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    speed: 0,
    frame: 0,
    samples: 2,
    spectrum: 1,
    hue: 184,
    shift: 0.35,
    shiftAngle: 190,
    perspective: 0,
    focusCenter: 0.8,
    focusEdges: 0,
    shiftBias: -1,
    noise: 0,
    noiseFrequency: 4,
    noiseOffset: 0,
    lensBulge: 0,
    lensRound: 0,
    debugCircle: false,
  },
} as const;

export const smokePreset: PrismPreset = {
  name: 'Smoke',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    samples: 50,
    spectrum: 1,
    hue: 280,
    shift: 0.65,
    shiftAngle: 0,
    perspective: 0.38,
    focusCenter: 0,
    focusEdges: 0.5,
    shiftBias: -1,
    noise: 1,
    noiseFrequency: 6,
    noiseOffset: 6.4,
    lensBulge: 0,
    lensRound: 0,
    debugCircle: false,
  },
} as const;

export const prismPresets: PrismPreset[] = [defaultPreset, fisheyePreset, duotonePreset, smokePreset];

export const Prism: React.FC<PrismProps> = memo(function PrismImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  samples = defaultPreset.params.samples,
  spectrum = defaultPreset.params.spectrum,
  hue = defaultPreset.params.hue,
  shift = defaultPreset.params.shift,
  shiftBias = defaultPreset.params.shiftBias,
  shiftAngle = defaultPreset.params.shiftAngle,
  perspective = defaultPreset.params.perspective,
  focusCenter = defaultPreset.params.focusCenter,
  focusEdges = defaultPreset.params.focusEdges,
  noise = defaultPreset.params.noise,
  noiseFrequency = defaultPreset.params.noiseFrequency,
  noiseOffset = defaultPreset.params.noiseOffset,
  lensBulge = defaultPreset.params.lensBulge,
  lensRound = defaultPreset.params.lensRound,
  debugCircle = defaultPreset.params.debugCircle,

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
    u_samples: samples,
    u_spectrum: spectrum,
    u_hue: hue,
    u_shift: shift,
    u_shiftBias: shiftBias,
    u_shiftAngle: shiftAngle,
    u_perspective: perspective,
    u_focusCenter: focusCenter,
    u_focusEdges: focusEdges,
    u_noise: noise,
    u_noiseFrequency: noiseFrequency,
    u_noiseOffset: noiseOffset,
    u_lensBulge: lensBulge,
    u_lensRound: lensRound,
    u_debugCircle: debugCircle,

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
}, colorPropsAreEqual);
