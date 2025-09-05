import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  voronoiFragmentShader,
  ShaderFitOptions,
  type VoronoiParams,
  type VoronoiUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface VoronoiProps extends ShaderComponentProps, VoronoiParams {}

type VoronoiPreset = ShaderPreset<VoronoiParams>;

export const defaultPreset: VoronoiPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    colors: ['#ff8247', '#ffe53d'],
    stepsPerColor: 3,
    colorGlow: '#ffffff',
    colorGap: '#2e0000',
    distortion: 0.4,
    gap: 0.04,
    glow: 0,
    scale: 0.5,
  },
};

export const cellsPreset: VoronoiPreset = {
  name: 'Cells',
  params: {
    ...defaultPatternSizing,
    scale: 0.5,
    speed: 0.5,
    frame: 0,
    colors: ['#ffffff'],
    stepsPerColor: 1,
    colorGlow: '#ffffff',
    colorGap: '#000000',
    distortion: 0.5,
    gap: 0.03,
    glow: 0.8,
  },
};

export const bubblesPreset: VoronoiPreset = {
  name: 'Bubbles',
  params: {
    ...defaultPatternSizing,
    scale: 0.75,
    speed: 0.5,
    frame: 0,
    colors: ['#83c9fb'],
    stepsPerColor: 1,
    colorGlow: '#ffffff',
    colorGap: '#ffffff',
    distortion: 0.4,
    gap: 0,
    glow: 1,
  },
};

export const lightsPreset: VoronoiPreset = {
  name: 'Lights',
  params: {
    ...defaultPatternSizing,
    scale: 3.3,
    speed: 0.5,
    frame: 0,
    colors: ['#fffffffc', '#bbff00', '#00ffff'],
    colorGlow: '#ff00d0',
    colorGap: '#ff00d0',
    stepsPerColor: 2,
    distortion: 0.38,
    gap: 0.0,
    glow: 1.0,
  },
};

export const voronoiPresets: VoronoiPreset[] = [defaultPreset, lightsPreset, cellsPreset, bubblesPreset];

export const Voronoi: React.FC<VoronoiProps> = memo(function VoronoiImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  stepsPerColor = defaultPreset.params.stepsPerColor,
  colorGlow = defaultPreset.params.colorGlow,
  colorGap = defaultPreset.params.colorGap,
  distortion = defaultPreset.params.distortion,
  gap = defaultPreset.params.gap,
  glow = defaultPreset.params.glow,

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
}: VoronoiProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_stepsPerColor: stepsPerColor,
    u_colorGlow: getShaderColorFromString(colorGlow),
    u_colorGap: getShaderColorFromString(colorGap),
    u_distortion: distortion,
    u_gap: gap,
    u_glow: glow,
    u_noiseTexture: getShaderNoiseTexture(),

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
  } satisfies VoronoiUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={voronoiFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
