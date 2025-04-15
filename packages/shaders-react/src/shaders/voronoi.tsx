import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultPatternSizing,
  getShaderColorFromString,
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
    colors: ['hsla(259, 100%, 50%, 1)', 'hsla(150, 100%, 50%, 1)', 'hsla(48, 100%, 50%, 1)', 'hsla(295, 100%, 50%, 1)'],
    colorGlow: 'hsla(266, 100%, 50%, 1)', // #3c00ff
    colorEdges: 'hsla(0, 0%, 100%, 1)', // #ffffff
    distortion: 0.42,
    edgeWidth: 0.06,
    edgesSoftness: 0.03,
    innerGlow: 0,
    mixing: 0,
  },
};

export const shadowPreset: VoronoiPreset = {
  name: 'Shadow',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    colors: ['hsla(259, 29%, 73%, 1)', 'hsla(263, 57%, 39%, 1)', 'hsla(48, 73%, 84%, 1)', 'hsla(295, 32%, 70%, 1)'],
    colorGlow: 'hsla(290, 18%, 42%, 1)', // #5a557c
    colorEdges: 'hsla(0, 0%, 100%, 1)', // #ffffff
    distortion: 0.23,
    edgeWidth: 0.005,
    edgesSoftness: 0.1,
    innerGlow: 0.42,
    mixing: 0,
  },
};

export const voronoiPresets: VoronoiPreset[] = [defaultPreset, shadowPreset];

export const Voronoi: React.FC<VoronoiProps> = memo(function VoronoiImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  colorGlow = defaultPreset.params.colorGlow,
  colorEdges = defaultPreset.params.colorEdges,
  distortion = defaultPreset.params.distortion,
  edgeWidth = defaultPreset.params.edgeWidth,
  edgesSoftness = defaultPreset.params.edgesSoftness,
  innerGlow = defaultPreset.params.innerGlow,
  mixing = defaultPreset.params.mixing,

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
    u_colorGlow: getShaderColorFromString(colorGlow),
    u_colorEdges: getShaderColorFromString(colorEdges),
    u_distortion: distortion,
    u_edgeWidth: edgeWidth,
    u_edgesSoftness: edgesSoftness,
    u_innerGlow: innerGlow,
    u_mixing: mixing,

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
