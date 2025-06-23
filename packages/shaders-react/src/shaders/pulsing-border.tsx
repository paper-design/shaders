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
    scale: 0.85,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#f2244f', '#4da6e6'],
    roundness: 0.5,
    thickness: 0.02,
    softness: 0.5,
    intensity: 2.4,
    spotsPerColor: 4,
    spotSize: 0.15,
    pulse: 0,
    smoke: 1,
    smokeSize: 1.3,
  },
};

export const circlePreset: PulsingBorderPreset = {
  name: 'Circle',
  params: {
    ...defaultObjectSizing,
    worldWidth: 200,
    worldHeight: 200,
    scale: 0.5,
    speed: 1,
    frame: 0,
    colorBack: '#0f191f',
    colors: ['#ffdd33', '#ff8c00', '#ff002b'],
    roundness: 1,
    thickness: 0.03,
    softness: 0.2,
    intensity: 2,
    spotsPerColor: 4,
    spotSize: 0.15,
    pulse: 0,
    smoke: 0,
    smokeSize: 1,
  },
};

export const innerBorderPreset: PulsingBorderPreset = {
  name: 'Inner Border',
  params: {
    ...defaultObjectSizing,
    speed: 1.0,
    frame: 0,
    colorBack: '#181821',
    colors: ['#2294d9', '#79fac5', '#e39e22'],
    roundness: 0,
    thickness: 0.05,
    softness: 1,
    intensity: 2,
    spotsPerColor: 3,
    spotSize: 0.15,
    pulse: 0.5,
    smoke: 0,
    smokeSize: 0,
  },
};

export const pulsingBorderPresets: PulsingBorderPreset[] = [defaultPreset, circlePreset, innerBorderPreset];

export const PulsingBorder: React.FC<PulsingBorderProps> = memo(function PulsingBorderImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  colorBack = defaultPreset.params.colorBack,
  roundness = defaultPreset.params.roundness,
  thickness = defaultPreset.params.thickness,
  softness = defaultPreset.params.softness,
  intensity = defaultPreset.params.intensity,
  spotsPerColor = defaultPreset.params.spotsPerColor,
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
  const noiseTexture = typeof window !== 'undefined' && { u_noiseTexture: getShaderNoiseTexture(0) };
  const pulseTexture = typeof window !== 'undefined' && { u_pulseTexture: getShaderNoiseTexture(1) };
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_roundness: roundness,
    u_thickness: thickness,
    u_softness: softness,
    u_intensity: intensity,
    u_spotsPerColor: spotsPerColor,
    u_spotSize: spotSize,
    u_pulse: pulse,
    u_smoke: smoke,
    u_smokeSize: smokeSize,
    ...pulseTexture,
    ...noiseTexture,

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
