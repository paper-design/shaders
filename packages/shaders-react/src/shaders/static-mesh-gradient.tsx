import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  staticMeshGradientFragmentShader,
  ShaderFitOptions,
  type StaticMeshGradientParams,
  type StaticMeshGradientUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface StaticMeshGradientProps extends ShaderComponentProps, StaticMeshGradientParams {}

type StaticMeshGradientPreset = ShaderPreset<StaticMeshGradientParams>;

export const defaultPreset: StaticMeshGradientPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    colors: ['#264653', '#9c2b2b', '#f4a261', '#ffffff'],
    positioning: 0,
    waveX: 0,
    waveXShift: 0,
    waveY: 0,
    waveYShift: 0,
    mixing: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const staticMeshGradientPresets: StaticMeshGradientPreset[] = [defaultPreset];

export const StaticMeshGradient: React.FC<StaticMeshGradientProps> = memo(function StaticMeshGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  positioning = defaultPreset.params.positioning,
  waveX = defaultPreset.params.waveX,
  waveXShift = defaultPreset.params.waveXShift,
  waveY = defaultPreset.params.waveY,
  waveYShift = defaultPreset.params.waveYShift,
  mixing = defaultPreset.params.mixing,
  grainMixer = defaultPreset.params.grainMixer,
  grainOverlay = defaultPreset.params.grainOverlay,

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
}: StaticMeshGradientProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_positioning: positioning,
    u_waveX: waveX,
    u_waveXShift: waveXShift,
    u_waveY: waveY,
    u_waveYShift: waveYShift,
    u_mixing: mixing,
    u_grainMixer: grainMixer,
    u_grainOverlay: grainOverlay,

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
  } satisfies StaticMeshGradientUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={staticMeshGradientFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
