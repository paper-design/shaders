import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  meshGradientFragmentShader,
  ShaderFitOptions,
  type MeshGradientParams,
  type MeshGradientUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface MeshGradientProps extends ShaderComponentProps, MeshGradientParams {}

type MeshGradientPreset = ShaderPreset<MeshGradientParams>;

export const defaultPreset: MeshGradientPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 40000,
    colors: ['#5100ff', '#00ff80', '#ffcc00', '#ea00ff'],
    distortion: 0.8,
    swirl: 0.1,
  },
};

export const purplePreset: MeshGradientPreset = {
  name: 'Purple',
  params: {
    ...defaultObjectSizing,
    speed: 0.6,
    frame: 100,
    colors: ['#aaa7d7', '#3c2b8e', '#f4eabb', '#c99cd5'],
    distortion: 0.3,
    swirl: 0.5,
  },
};

export const beachPreset: MeshGradientPreset = {
  name: 'Beach',
  params: {
    ...defaultObjectSizing,
    speed: 0.1,
    frame: 0,
    colors: ['#bcecf6', '#80c3e4', '#f3eccb', '#f3d987'],
    distortion: 0.8,
    swirl: 0.35,
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset, purplePreset, beachPreset];

export const MeshGradient: React.FC<MeshGradientProps> = memo(function MeshGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  distortion = defaultPreset.params.distortion,
  swirl = defaultPreset.params.swirl,

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
}: MeshGradientProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_distortion: distortion,
    u_swirl: swirl,

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
  } satisfies MeshGradientUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={meshGradientFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
