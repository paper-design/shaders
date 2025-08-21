import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  grainAndNoiseFragmentShader,
  ShaderFitOptions,
  type GrainAndNoiseParams,
  type GrainAndNoiseUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface GrainAndNoiseProps extends ShaderComponentProps, GrainAndNoiseParams {}

type GrainAndNoisePreset = ShaderPreset<GrainAndNoiseParams>;

export const defaultPreset: GrainAndNoisePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['#ff0000', '#00ff00', '#0000ff'],
    grain: 0.5,
    fiber: 0.5,
    scale: 1,
  },
};

export const monochromeFiberPreset: GrainAndNoisePreset = {
  name: 'Monochrome fiber',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['#000000', '#ffffff'],
    grain: 0,
    fiber: 1,
    scale: 1,
  },
};

export const smallGrainPreset: GrainAndNoisePreset = {
  name: 'Small grain',
  params: {
    ...defaultObjectSizing,
    speed: 3,
    frame: 0,
    colors: ['#ff0000', '#00ff00', '#0000ff'],
    grain: 1,
    fiber: 0,
    scale: 0.5,
  },
};

export const staticPreset: GrainAndNoisePreset = {
  name: 'Static color',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    colors: ['#ff00d452'],
    grain: 1,
    fiber: 0.5,
    scale: 1,
  },
};

export const grainAndNoisePresets: GrainAndNoisePreset[] = [defaultPreset, smallGrainPreset, monochromeFiberPreset, staticPreset] as const;

export const GrainAndNoise: React.FC<GrainAndNoiseProps> = memo(function GrainAndNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  grain = defaultPreset.params.grain,
  fiber = defaultPreset.params.fiber,

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
}: GrainAndNoiseProps) {
  const noiseTexture = typeof window !== 'undefined' && { u_noiseTexture: getShaderNoiseTexture() };

  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_grain: grain,
    u_fiber: fiber,
    ...noiseTexture,

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
  } satisfies GrainAndNoiseUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={grainAndNoiseFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
