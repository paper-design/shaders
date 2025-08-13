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
    colorGrain: '#ff4444',
    colorFiber: '#00ff00',
    colorFiberScd: '#0000ff',
    grain: 0.4,
    fiber: 0.32,
    seed: 0,
  },
};

export const grainAndNoisePresets: GrainAndNoisePreset[] = [defaultPreset] as const;

export const GrainAndNoise: React.FC<GrainAndNoiseProps> = memo(function GrainAndNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorGrain = defaultPreset.params.colorGrain,
  colorFiber = defaultPreset.params.colorFiber,
  colorFiberScd = defaultPreset.params.colorFiberScd,
  grain = defaultPreset.params.grain,
  fiber = defaultPreset.params.fiber,
  seed = defaultPreset.params.seed,

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
    u_colorGrain: getShaderColorFromString(colorGrain),
    u_colorFiber: getShaderColorFromString(colorFiber),
    u_colorFiberScd: getShaderColorFromString(colorFiberScd),
    u_grain: grain,
    u_fiber: fiber,
    u_seed: seed,
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
