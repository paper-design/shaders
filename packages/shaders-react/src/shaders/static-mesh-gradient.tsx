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
    colors: ['#000000', '#00ff80', '#ffcc00', '#ea00ff'],
    distortion: 0.8,
    distortionSeed: 0,
    swirl: 0.1,
    swirlSeed: 0,
  },
};

export const staticMeshGradientPresets: StaticMeshGradientPreset[] = [defaultPreset];

export const StaticMeshGradient: React.FC<StaticMeshGradientProps> = memo(function StaticMeshGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  distortion = defaultPreset.params.distortion,
  distortionSeed = defaultPreset.params.distortionSeed,
  swirl = defaultPreset.params.swirl,
  swirlSeed = defaultPreset.params.swirlSeed,

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
    u_distortion: distortion,
    u_distortionSeed: distortionSeed,
    u_swirl: swirl,
    u_swirlSeed: swirlSeed,

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
