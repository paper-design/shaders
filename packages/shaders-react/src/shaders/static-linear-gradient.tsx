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
    speed: 1,
    frame: 40000,
    colors: ['#000000', '#00ff80', '#ffcc00', '#ea00ff'],
    distortion: 0.8,
    swirl: 0.1,
    mixing: 0.7,
  },
};

export const staticLinearGradientPresets: StaticLinearGradientPreset[] = [defaultPreset];

export const StaticLinearGradient: React.FC<StaticLinearGradientProps> = memo(function StaticLinearGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  distortion = defaultPreset.params.distortion,
  swirl = defaultPreset.params.swirl,
  mixing = defaultPreset.params.swirl,

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
    u_distortion: distortion,
    u_swirl: swirl,
    u_mixing: mixing,

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
