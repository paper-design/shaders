import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
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

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: VoronoiPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    colors: ['hsla(15, 80%, 50%, 1)', 'hsla(50, 80%, 50%, 1)', 'hsla(200, 80%, 50%, 1)'],
    stepsPerColor: 1,
    colorGlow: 'hsla(266, 100%, 50%, 1)',
    colorBack: 'hsla(0, 0%, 100%, 1)',
    distortion: 0.42,
    gap: 0.06,
    innerGlow: 0,
  },
};

export const shadowPreset: VoronoiPreset = {
  name: 'Shadow',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    colors: ['hsla(259, 29%, 98%, 1)', 'hsla(48, 73%, 98%, 1)', 'hsla(295, 32%, 98%, 1)'],
    stepsPerColor: 1,
    colorGlow: 'hsla(290, 18%, 42%, 1)',
    colorBack: 'hsla(0, 0%, 100%, 1)',
    distortion: 0.23,
    gap: 0,
    innerGlow: 0.8,
  },
};

export const voronoiPresets: VoronoiPreset[] = [defaultPreset, shadowPreset];

export const Voronoi: React.FC<VoronoiProps> = memo(function VoronoiImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  stepsPerColor = defaultPreset.params.stepsPerColor,
  colorGlow = defaultPreset.params.colorGlow,
  colorBack = defaultPreset.params.colorBack,
  distortion = defaultPreset.params.distortion,
  gap = defaultPreset.params.gap,
  innerGlow = defaultPreset.params.innerGlow,

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
  const noiseTexture = typeof window !== 'undefined' && { u_noiseTexture: getShaderNoiseTexture() };

  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_stepsPerColor: stepsPerColor,
    u_colorGlow: getShaderColorFromString(colorGlow),
    u_colorBack: getShaderColorFromString(colorBack),
    u_distortion: distortion,
    u_gap: gap,
    u_innerGlow: innerGlow,
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
  } satisfies VoronoiUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={voronoiFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
