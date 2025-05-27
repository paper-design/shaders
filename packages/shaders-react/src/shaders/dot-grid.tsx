import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  getShaderColorFromString,
  dotGridFragmentShader,
  DotGridShapes,
  ShaderFitOptions,
  type DotGridParams,
  type DotGridUniforms,
  type ShaderPreset,
  defaultPatternSizing,
} from '@paper-design/shaders';

export interface DotGridProps extends ShaderComponentProps, DotGridParams {}

type DotGridPreset = ShaderPreset<DotGridParams>;

export const defaultPreset: DotGridPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    colorBack: '#000000',
    colorFill: '#ffffff',
    colorStroke: '#dd5500',
    size: 2,
    gapX: 50,
    gapY: 50,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 0,
    shape: 'circle',
  },
};

export const macrodataPreset: DotGridPreset = {
  name: 'Macrodata',
  params: {
    ...defaultPatternSizing,
    colorBack: '#15212d',
    colorFill: '#5794ff',
    colorStroke: '#0000ff',
    size: 3,
    gapX: 25,
    gapY: 25,
    strokeWidth: 0,
    sizeRange: 0.25,
    opacityRange: 0.9,
    shape: 'circle',
  },
};

const trianglesPreset: DotGridPreset = {
  name: 'Triangles',
  params: {
    ...defaultPatternSizing,
    colorBack: '#ffffff',
    colorFill: '#ffffff',
    colorStroke: '#808080',
    size: 5,
    gapX: 32,
    gapY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: 'triangle',
  },
};

const bubblesPreset: DotGridPreset = {
  name: 'Bubbles',
  params: {
    ...defaultPatternSizing,
    colorBack: '#002c9e80',
    colorFill: '#ffffff',
    colorStroke: '#000000',
    size: 15,
    gapX: 60,
    gapY: 60,
    strokeWidth: 12,
    sizeRange: 0.7,
    opacityRange: 1.3,
    shape: 'circle',
  },
};

const treeLinePreset: DotGridPreset = {
  name: 'Tree line',
  params: {
    ...defaultPatternSizing,
    colorBack: '#f4fce7',
    colorFill: '#052e19',
    colorStroke: '#000000',
    size: 8,
    gapX: 20,
    gapY: 90,
    strokeWidth: 0,
    sizeRange: 1,
    opacityRange: 0.6,
    shape: 'circle',
  },
};

const diamondsPreset: DotGridPreset = {
  name: 'Diamonds',
  params: {
    ...defaultPatternSizing,
    colorBack: '#ffffff',
    colorFill: '#ff0000',
    colorStroke: '#000000',
    size: 15,
    gapX: 30,
    gapY: 30,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 2,
    shape: 'diamond',
  },
};

const wallpaperPreset: DotGridPreset = {
  name: 'Wallpaper',
  params: {
    ...defaultPatternSizing,
    colorBack: '#204030',
    colorFill: '#000000',
    colorStroke: '#bd955b',
    size: 9,
    gapX: 32,
    gapY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: 'diamond',
  },
};

const matrixPreset: DotGridPreset = {
  name: 'Enter the Matrix',
  params: {
    ...defaultPatternSizing,
    colorBack: '#000000',
    colorFill: '#47ffea',
    colorStroke: '#000000',
    size: 2,
    gapX: 10,
    gapY: 10,
    strokeWidth: 0.5,
    sizeRange: 0.25,
    opacityRange: 1,
    shape: 'triangle',
  },
};

const waveformPreset: DotGridPreset = {
  name: 'Waveform',
  params: {
    ...defaultPatternSizing,
    colorBack: '#ffffff',
    colorFill: '#0934b8',
    colorStroke: '#000000',
    size: 100,
    gapX: 2,
    gapY: 215,
    strokeWidth: 0,
    sizeRange: 1,
    opacityRange: 0,
    shape: 'square',
  },
};

export const dotGridPresets: DotGridPreset[] = [
  defaultPreset,
  macrodataPreset,
  trianglesPreset,
  bubblesPreset,
  treeLinePreset,
  diamondsPreset,
  wallpaperPreset,
  matrixPreset,
  waveformPreset,
];

export const DotGrid: React.FC<DotGridProps> = memo(function DotGridImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorFill = defaultPreset.params.colorFill,
  colorStroke = defaultPreset.params.colorStroke,
  size = defaultPreset.params.size,
  gapX = defaultPreset.params.gapX,
  gapY = defaultPreset.params.gapY,
  strokeWidth = defaultPreset.params.strokeWidth,
  sizeRange = defaultPreset.params.sizeRange,
  opacityRange = defaultPreset.params.opacityRange,
  shape = defaultPreset.params.shape,

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

  // Other props
  maxPixelCount = 6016 * 3384, // Higher max resolution for this shader
  ...props
}: DotGridProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFill: getShaderColorFromString(colorFill),
    u_colorStroke: getShaderColorFromString(colorStroke),
    u_dotSize: size,
    u_gapX: gapX,
    u_gapY: gapY,
    u_strokeWidth: strokeWidth,
    u_sizeRange: sizeRange,
    u_opacityRange: opacityRange,
    u_shape: DotGridShapes[shape],

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
  } satisfies DotGridUniforms;

  return (
    <ShaderMount {...props} maxPixelCount={maxPixelCount} fragmentShader={dotGridFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
