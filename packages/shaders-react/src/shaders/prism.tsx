import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  prismFragmentShader,
  getShaderColorFromString,
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
    scale: 0.8,
    fit: 'contain',
    speed: 0,
    frame: 0,
    colorBack: '#f3f3ec',
    colorSteps: 10,
    hue: 180,
    shift: 1,
    shiftAngle: 0,
    perspective: 1,
    centerFalloff: 0,
    edgeFalloff: 0,
    shiftBias: 0,
    noise: 0,
    noiseFrequency: 4,
    noiseOffset: 0,
    distortion: 0,
    distortionRadiality: 1,
    debugCircle: false,
  },
} as const;

export const fadedPreset: PrismPreset = {
  name: 'Faded',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    speed: 0,
    frame: 0,
    colorBack: '#f3f3ec',
    colorSteps: 3,
    hue: 40,
    shift: 0.1,
    shiftAngle: 0,
    perspective: 0,
    centerFalloff: 0,
    edgeFalloff: 0,
    shiftBias: 0,
    noise: 0,
    noiseFrequency: 4,
    noiseOffset: 0,
    distortion: 0,
    distortionRadiality: 1,
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
    colorBack: '#000000',
    colorSteps: 2,
    hue: 192,
    shift: 0.2,
    shiftAngle: 0,
    perspective: 0,
    centerFalloff: 0,
    edgeFalloff: 0,
    shiftBias: 0,
    noise: 0,
    noiseFrequency: 4,
    noiseOffset: 0,
    distortion: 0,
    distortionRadiality: 1,
    debugCircle: false,
  },
} as const;

export const spectrumPreset: PrismPreset = {
  name: 'Spectrum',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    speed: 0,
    frame: 0,
    colorBack: '#f3f3ec',
    colorSteps: 8,
    hue: 0,
    shift: 0.25,
    shiftAngle: 0,
    perspective: 0,
    centerFalloff: 0,
    edgeFalloff: 0,
    shiftBias: -0.6,
    noise: 0,
    noiseFrequency: 4,
    noiseOffset: 0,
    distortion: 0,
    distortionRadiality: 1,
    debugCircle: false,
  },
} as const;

export const prismPresets: PrismPreset[] = [defaultPreset, fadedPreset, duotonePreset, spectrumPreset];

export const Prism: React.FC<PrismProps> = memo(function PrismImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  colorBack = defaultPreset.params.colorBack,
  colorSteps = defaultPreset.params.colorSteps,
  hue = defaultPreset.params.hue,
  shift = defaultPreset.params.shift,
  shiftBias = defaultPreset.params.shiftBias,
  shiftAngle = defaultPreset.params.shiftAngle,
  perspective = defaultPreset.params.perspective,
  centerFalloff = defaultPreset.params.centerFalloff,
  edgeFalloff = defaultPreset.params.edgeFalloff,
  noise = defaultPreset.params.noise,
  noiseFrequency = defaultPreset.params.noiseFrequency,
  noiseOffset = defaultPreset.params.noiseOffset,
  distortion = defaultPreset.params.distortion,
  distortionRadiality = defaultPreset.params.distortionRadiality,
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
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorSteps: colorSteps,
    u_hue: hue,
    u_shift: shift,
    u_shiftBias: shiftBias,
    u_shiftAngle: shiftAngle,
    u_perspective: perspective,
    u_centerFalloff: centerFalloff,
    u_edgeFalloff: edgeFalloff,
    u_noise: noise,
    u_noiseFrequency: noiseFrequency,
    u_noiseOffset: noiseOffset,
    u_distortion: distortion,
    u_distortionRadiality: distortionRadiality,
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
