import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  staticLinearGradientFragmentShader,
  ShaderFitOptions,
  type StaticLinearGradientParams,
  type StaticLinearGradientUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface StaticLinearGradientProps extends ShaderComponentProps, StaticLinearGradientParams {}

type StaticLinearGradientPreset = ShaderPreset<StaticLinearGradientParams>;

export const defaultPreset: StaticLinearGradientPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.5,
    rotation: 160,
    speed: 1,
    frame: 0,
    colors: ['#264653', '#2a9d8f', '#f4a261', '#ffffff'],
    falloffTop: -0.3,
    falloffBottom: -0.3,
    mixing: 0.7,
    repeatY: true,
    grainMixer: 0.25,
    grainOverlay: 0.25,
  },
};

export const staticLinearGradientPresets: StaticLinearGradientPreset[] = [defaultPreset];

export const StaticLinearGradient: React.FC<StaticLinearGradientProps> = memo(function StaticLinearGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  falloffTop = defaultPreset.params.falloffTop,
  falloffBottom = defaultPreset.params.falloffBottom,
  mixing = defaultPreset.params.falloffBottom,
  repeatY = defaultPreset.params.repeatY,
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
}: StaticLinearGradientProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_falloffTop: falloffTop,
    u_falloffBottom: falloffBottom,
    u_mixing: mixing,
    u_repeatY: repeatY,
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
  } satisfies StaticLinearGradientUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={staticLinearGradientFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
