import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  staticRadialGradientFragmentShader,
  ShaderFitOptions,
  type StaticRadialGradientParams,
  type StaticRadialGradientUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface StaticRadialGradientProps extends ShaderComponentProps, StaticRadialGradientParams {}

type StaticRadialGradientPreset = ShaderPreset<StaticRadialGradientParams>;

export const defaultPreset: StaticRadialGradientPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colors: ['#264653', '#9c2b2b', '#f4a261', '#ffffff'],
    radius: 1,
    focalDistance: 0,
    focalAngle: 0,
    falloff: 0,
    mixing: 0.7,
    distortion: 0,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const staticRadialGradientPresets: StaticRadialGradientPreset[] = [defaultPreset];

export const StaticRadialGradient: React.FC<StaticRadialGradientProps> = memo(function StaticRadialGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  radius = defaultPreset.params.radius,
  focalDistance = defaultPreset.params.focalDistance,
  focalAngle = defaultPreset.params.focalAngle,
  falloff = defaultPreset.params.falloff,
  grainMixer = defaultPreset.params.grainMixer,
  mixing = defaultPreset.params.mixing,
  distortion = defaultPreset.params.distortion,
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
}: StaticRadialGradientProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_radius: radius,
    u_focalDistance: focalDistance,
    u_focalAngle: focalAngle,
    u_falloff: falloff,
    u_mixing: mixing,
    u_distortion: distortion,
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
  } satisfies StaticRadialGradientUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={staticRadialGradientFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
