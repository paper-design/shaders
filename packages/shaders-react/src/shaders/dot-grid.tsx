import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
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

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export interface DotGridProps extends ShaderComponentProps, DotGridParams {}

type DotGridPreset = ShaderPreset<DotGridParams>;

export const defaultPreset: DotGridPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colorFill: 'hsla(0, 0%, 100%, 1)',
    colorStroke: 'hsla(40, 100%, 50%, 1)',
    dotSize: 2,
    gridSpacingX: 50,
    gridSpacingY: 50,
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
    colorBack: 'hsla(211, 37%, 13%, 1)',
    colorFill: 'hsla(218, 100%, 67%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 3,
    gridSpacingX: 25,
    gridSpacingY: 25,
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
    colorBack: 'hsla(0, 0%, 100%, 1)',
    colorFill: 'hsla(0, 0%, 100%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, .5)',
    dotSize: 5,
    gridSpacingX: 32,
    gridSpacingY: 32,
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
    colorBack: 'hsla(234, 100%, 31%, .5)',
    colorFill: 'hsla(100, 30%, 100%, 1)',
    colorStroke: 'hsla(0, 100%, 0%, 1)',
    dotSize: 28,
    gridSpacingX: 60,
    gridSpacingY: 60,
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
    colorBack: 'hsla(100, 100%, 36%, .05)',
    colorFill: 'hsla(150, 80%, 10%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 8,
    gridSpacingX: 20,
    gridSpacingY: 90,
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
    colorBack: 'hsla(0, 0%, 0%, 0)',
    colorFill: 'hsla(0, 100%, 50%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 15,
    gridSpacingX: 30,
    gridSpacingY: 30,
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
    colorBack: 'hsla(154, 33%, 19%, 1)',
    colorFill: 'hsla(0, 0%, 0%, 0)',
    colorStroke: 'hsla(36, 48%, 58%, 1)',
    dotSize: 9,
    gridSpacingX: 32,
    gridSpacingY: 32,
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
    colorBack: 'hsla(0, 100%, 0%, 1)',
    colorFill: 'hsla(182, 100%, 64%, 1)',
    colorStroke: 'hsla(0, 100%, 100%, 0)',
    dotSize: 2,
    gridSpacingX: 10,
    gridSpacingY: 10,
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
    colorBack: 'hsla(0, 100%, 100%, 1)',
    colorFill: 'hsla(227, 93%, 38%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 0)',
    dotSize: 100,
    gridSpacingX: 2,
    gridSpacingY: 215,
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
  dotSize = defaultPreset.params.dotSize,
  gridSpacingX = defaultPreset.params.gridSpacingX,
  gridSpacingY = defaultPreset.params.gridSpacingY,
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
    u_dotSize: dotSize,
    u_gridSpacingX: gridSpacingX,
    u_gridSpacingY: gridSpacingY,
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
