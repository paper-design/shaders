import { memo, useMemo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
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
    color1: 'hsla(208, 65%, 31%, 1)', // #135572
    color2: 'hsla(35, 79%, 66%, 1)', // #eb8c0f
    colorShadow: 'hsla(266, 100%, 50%, 1)', // #3c00ff
    colorEdges: 'hsla(0, 0%, 100%, 1)', // #ffffff
    distortion: 0.42,
    edgeWidth: 0.06,
    edgesSoftness: 0.03,
    edgesRoundness: 0,
    shade: 0,
  },
};
export const roundPreset: VoronoiPreset = {
  name: 'Round',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    color1: 'hsla(0, 0%, 100%, 1)', // #ffffff
    color2: 'hsla(0, 0%, 100%, 1)', // #ffffff
    colorShadow: 'hsla(0, 0%, 100%, 1)', // #ffffff
    colorEdges: 'hsla(0, 90%, 4%, 1)', // #130707
    distortion: 0.22,
    edgeWidth: 0.01,
    edgesSoftness: 0.02,
    edgesRoundness: 0.48,
    shade: 0,
  },
};
export const shadowPreset: VoronoiPreset = {
  name: 'Shadow',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    color1: 'hsla(0, 0%, 100%, 1)', // #ffffff
    color2: 'hsla(0, 0%, 97%, 1)', // #f7f7f7
    colorShadow: 'hsla(290, 18%, 42%, 1)', // #5a557c
    colorEdges: 'hsla(0, 0%, 100%, 1)', // #ffffff
    distortion: 0.23,
    edgeWidth: 0.01,
    edgesSoftness: 0.12,
    edgesRoundness: 0,
    shade: 0.42,
  },
};

export const voronoiPresets: VoronoiPreset[] = [defaultPreset, roundPreset, shadowPreset];

export const Voronoi: React.FC<VoronoiProps> = memo(function VoronoiImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  colorShadow = defaultPreset.params.colorShadow,
  colorEdges = defaultPreset.params.colorEdges,
  distortion = defaultPreset.params.distortion,
  edgeWidth = defaultPreset.params.edgeWidth,
  edgesSoftness = defaultPreset.params.edgesSoftness,
  edgesRoundness = defaultPreset.params.edgesRoundness,
  shade = defaultPreset.params.shade,

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
}) {
  const uniforms = {
    // Own uniforms
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_colorShadow: getShaderColorFromString(colorShadow),
    u_colorEdges: getShaderColorFromString(colorEdges),
    u_distortion: distortion,
    u_edgeWidth: edgeWidth,
    u_edgesSoftness: edgesSoftness,
    u_edgesRoundness: edgesRoundness,
    u_shade: shade,

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
});
