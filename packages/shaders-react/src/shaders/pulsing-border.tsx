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

export interface PulsingBorderProps extends ShaderComponentProps, PulsingBorderParams {}

type PulsingBorderPreset = ShaderPreset<PulsingBorderParams>;

export const defaultPreset: PulsingBorderPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#0dc1fd', '#d915ef', '#ff3f2ecc'],
    roundness: 0.25,
    thickness: 0.4,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    aspectRatio: 1,
    softness: 0,
    intensity: 0.2,
    bloom: 0.45,
    spots: 3,
    spotSize: 0.4,
    pulse: 0.5,
    smoke: 0,
    smokeSize: 0.6,
  },
};

export const circlePreset: PulsingBorderPreset = {
  name: 'Circle',
  params: {
    ...defaultObjectSizing,
    worldWidth: 400,
    worldHeight: 400,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#0dc1fd', '#d915ef', '#ff3f2ecc'],
    roundness: 1,
    thickness: 0.4,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    aspectRatio: 1,
    softness: 1,
    intensity: 0.8,
    bloom: 0.8,
    spots: 2,
    spotSize: 0.45,
    pulse: 0,
    smoke: 0.25,
    smokeSize: 0.62,
  },
};

export const northernLightsPreset: PulsingBorderPreset = {
  name: 'Northern lights',
  params: {
    ...defaultObjectSizing,
    speed: 0.18,
    frame: 0,
    colors: ['#3426f2', '#156ba8', '#126964', '#0affba', '#4733cc'],
    colorBack: '#0c182c',
    roundness: 0,
    thickness: 1,
    softness: 1,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    aspectRatio: 1,
    intensity: 0,
    bloom: 0.5,
    spots: 4,
    spotSize: 0,
    pulse: 0,
    smoke: 0.7,
    smokeSize: 0.7,
  },
};

export const solidLinePreset: PulsingBorderPreset = {
  name: 'Solid line',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['#ffade4', '#e13381', '#fa389f'],
    colorBack: '#00000000',
    roundness: 0,
    thickness: 0.1,
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    aspectRatio: 1,
    softness: 0.0,
    intensity: 0.0,
    bloom: 0.15,
    spots: 4,
    spotSize: 0.5,
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
  margin = defaultPreset.params.margin,
  marginLeft = defaultPreset.params.marginLeft,
  marginRight = defaultPreset.params.marginRight,
  marginTop = defaultPreset.params.marginTop,
  marginBottom = defaultPreset.params.marginBottom,
  aspectRatio = defaultPreset.params.aspectRatio,
  softness = defaultPreset.params.softness,
  bloom = defaultPreset.params.bloom,
  intensity = defaultPreset.params.intensity,
  spots = defaultPreset.params.spots,
  spotSize = defaultPreset.params.spotSize,
  pulse = defaultPreset.params.pulse,
  smoke = defaultPreset.params.smoke,
  smokeSize = defaultPreset.params.smokeSize,

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
    u_margin: margin,
    u_marginLeft: marginLeft,
    u_marginRight: marginRight,
    u_marginTop: marginTop,
    u_marginBottom: marginBottom,
    u_aspectRatio: aspectRatio,
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
