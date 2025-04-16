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
    scale: 1.5,
    speed: 0.5,
    frame: 0,
    colorCell1: 'hsla(15, 80%, 50%, 1)',
    colorCell2: 'hsla(180, 80%, 50%, 1)',
    colorCell3: 'hsla(200, 80%, 50%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 0.5,
    distance: 0.25,
    edgesSize: 0.15,
    edgesSoftness: 0.01,
    middleSize: 0,
    middleSoftness: 0,
  },
};

export const classicPreset: VoronoiPreset = {
  name: 'Classic',
  params: {
    ...defaultPatternSizing,
    scale: 3,
    speed: 0.8,
    frame: 0,
    colorCell1: 'hsla(0, 100%, 100%, 1)',
    colorCell2: 'hsla(0, 0%, 100%, 1)',
    colorCell3: 'hsla(0, 100%, 0%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 1,
    distance: 0.45,
    edgesSize: 0.02,
    edgesSoftness: 0.07,
    middleSize: 0,
    middleSoftness: 0,
  },
};

export const giraffePreset: VoronoiPreset = {
  name: 'Giraffe',
  params: {
    ...defaultPatternSizing,
    scale: 1,
    speed: 0.6,
    frame: 0,
    colorCell1: 'hsla(32, 100%, 18%, 1)',
    colorCell2: 'hsla(42, 93%, 35%, 1)',
    colorCell3: 'hsla(32, 100%, 18%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(45, 100%, 96%, 1)',
    colorGradient: 1,
    distance: 0.25,
    edgesSize: 0.2,
    edgesSoftness: 0.01,
    middleSize: 0,
    middleSoftness: 0,
  },
};

export const eyesPreset: VoronoiPreset = {
  name: 'Eyes',
  params: {
    ...defaultPatternSizing,
    scale: 1.6,
    speed: 0.6,
    frame: 0,
    colorCell1: 'hsla(79, 84%, 60%, 1)',
    colorCell2: 'hsla(207, 53%, 41%, 1)',
    colorCell3: 'hsla(207, 80%, 65%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(0, 100%, 100%, 1)',
    colorGradient: 1,
    distance: 0.25,
    edgesSize: 0.62,
    edgesSoftness: 0.01,
    middleSize: 0.1,
    middleSoftness: 0,
  },
};

export const bubblesPreset: VoronoiPreset = {
  name: 'Bubbles',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    speed: 0.5,
    frame: 0,
    colorCell1: 'hsla(0, 100%, 50%, 1)',
    colorCell2: 'hsla(169, 100%, 66%, 1)',
    colorCell3: 'hsla(50, 100%, 66%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 1,
    distance: 0.5,
    edgesSize: 0.81,
    edgesSoftness: 0.0,
    middleSize: 0,
    middleSoftness: 0,
  },
};

export const cellsPreset: VoronoiPreset = {
  name: 'Cells',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    speed: 1,
    frame: 0,
    colorCell1: 'hsla(0, 0%, 100%, 1)',
    colorCell2: 'hsla(0, 0%, 100%, 1)',
    colorCell3: 'hsla(0, 0%, 100%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(200, 50%, 15%, 1)',
    colorGradient: 1,
    distance: 0.38,
    edgesSize: 0.1,
    edgesSoftness: 0.02,
    middleSize: 0,
    middleSoftness: 0,
  },
};

export const glowPreset: VoronoiPreset = {
  name: 'Glow',
  params: {
    ...defaultPatternSizing,
    scale: 1.2,
    speed: 0.8,
    frame: 0,
    colorCell1: 'hsla(40, 100%, 50%, 1)',
    colorCell2: 'hsla(311, 100%, 59%, 1)',
    colorCell3: 'hsla(180, 100%, 65%, 1)',
    colorMid: 'hsla(0, 0%, 100%, 1)',
    colorEdges: 'hsla(0, 100%, 0%, 1)',
    colorGradient: 1,
    distance: 0.25,
    edgesSize: 0.15,
    edgesSoftness: 0.01,
    middleSize: 0.7,
    middleSoftness: 1,
  },
};

export const tilesPreset: VoronoiPreset = {
  name: 'Tiles',
  params: {
    ...defaultPatternSizing,
    scale: 1.3,
    speed: 1,
    frame: 0,
    colorCell1: 'hsla(80, 50%, 50%, 1)',
    colorCell2: 'hsla(0, 50%, 100%, 1)',
    colorCell3: 'hsla(200, 50%, 50%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(200, 50%, 10%, 1)',
    colorGradient: 0,
    distance: 0.05,
    edgesSize: 0.25,
    edgesSoftness: 0.02,
    middleSize: 0,
    middleSoftness: 0,
  },
};

export const voronoiPresets: VoronoiPreset[] = [
  defaultPreset,
  classicPreset,
  giraffePreset,
  eyesPreset,
  bubblesPreset,
  cellsPreset,
  glowPreset,
  tilesPreset,
];

export const Voronoi: React.FC<VoronoiProps> = memo(function VoronoiImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorCell1 = defaultPreset.params.colorCell1,
  colorCell2 = defaultPreset.params.colorCell2,
  colorCell3 = defaultPreset.params.colorCell3,
  colorMid = defaultPreset.params.colorMid,
  colorEdges = defaultPreset.params.colorEdges,
  colorGradient = defaultPreset.params.colorGradient,
  distance = defaultPreset.params.distance,
  edgesSize = defaultPreset.params.edgesSize,
  edgesSoftness = defaultPreset.params.edgesSoftness,
  middleSize = defaultPreset.params.middleSize,
  middleSoftness = defaultPreset.params.middleSoftness,

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
    u_colorCell1: getShaderColorFromString(colorCell1),
    u_colorCell2: getShaderColorFromString(colorCell2),
    u_colorCell3: getShaderColorFromString(colorCell3),
    u_colorMid: getShaderColorFromString(colorMid),
    u_colorEdges: getShaderColorFromString(colorEdges),
    u_colorGradient: colorGradient,
    u_distance: distance,
    u_edgesSize: edgesSize,
    u_edgesSoftness: edgesSoftness,
    u_middleSize: middleSize,
    u_middleSoftness: middleSoftness,

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
