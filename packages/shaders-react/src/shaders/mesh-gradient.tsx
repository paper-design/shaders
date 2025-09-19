import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
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
    frame: 0,
    colors: ['#e0eaff', '#241d9a', '#f75092', '#9f50d3'],
    distortion: 0.8,
    swirl: 0.1,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const purplePreset: MeshGradientPreset = {
  name: 'Purple',
  params: {
    ...defaultObjectSizing,
    speed: 0.6,
    frame: 0,
    colors: ['#aaa7d7', '#3c2b8e'],
    distortion: 1,
    swirl: 1,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const beachPreset: MeshGradientPreset = {
  name: 'Beach',
  params: {
    ...defaultObjectSizing,
    speed: 0.1,
    frame: 0,
    colors: ['#bcecf6', '#00aaff', '#00f7ff', '#ffd447'],
    distortion: 0.8,
    swirl: 0.35,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const inkPreset: MeshGradientPreset = {
  name: 'Ink',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['#ffffff', '#000000'],
    distortion: 1,
    swirl: 0.2,
    rotation: 90,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset, inkPreset, purplePreset, beachPreset];

export const MeshGradient: React.FC<MeshGradientProps> = memo(function MeshGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  distortion = defaultPreset.params.distortion,
  swirl = defaultPreset.params.swirl,
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
}: MeshGradientProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_distortion: distortion,
    u_swirl: swirl,
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
