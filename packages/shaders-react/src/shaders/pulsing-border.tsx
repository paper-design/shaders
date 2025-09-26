import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  pulsingBorderFragmentShader,
  ShaderFitOptions,
  type PulsingBorderParams,
  type PulsingBorderUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';
import { PulsingBorderAspectRatios } from '@paper-design/shaders';

export interface PulsingBorderProps extends ShaderComponentProps, PulsingBorderParams {}

type PulsingBorderPreset = ShaderPreset<PulsingBorderParams>;

export const defaultPreset: PulsingBorderPreset = {
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

export const circlePreset: PulsingBorderPreset = {
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

export const northernLightsPreset: PulsingBorderPreset = {
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

export const solidLinePreset: PulsingBorderPreset = {
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
    softness: 0.0,
    intensity: 0.0,
    bloom: 0.15,
    spots: 4,
    spotSize: 1,
    pulse: 0,
    smoke: 0,
    smokeSize: 0,
  },
};

export const pulsingBorderPresets: PulsingBorderPreset[] = [
  defaultPreset,
  circlePreset,
  northernLightsPreset,
  solidLinePreset,
];

export const PulsingBorder: React.FC<PulsingBorderProps> = memo(function PulsingBorderImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  colorBack = defaultPreset.params.colorBack,
  roundness = defaultPreset.params.roundness,
  thickness = defaultPreset.params.thickness,
  aspectRatio = defaultPreset.params.aspectRatio,
  softness = defaultPreset.params.softness,
  bloom = defaultPreset.params.bloom,
  intensity = defaultPreset.params.intensity,
  spots = defaultPreset.params.spots,
  spotSize = defaultPreset.params.spotSize,
  pulse = defaultPreset.params.pulse,
  smoke = defaultPreset.params.smoke,
  smokeSize = defaultPreset.params.smokeSize,
  margin,
  marginLeft = margin ?? defaultPreset.params.marginLeft,
  marginRight = margin ?? defaultPreset.params.marginRight,
  marginTop = margin ?? defaultPreset.params.marginTop,
  marginBottom = margin ?? defaultPreset.params.marginBottom,

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
}: PulsingBorderProps) {
  const uniforms = {
    // Own uniforms
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
  } satisfies PulsingBorderUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={pulsingBorderFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
