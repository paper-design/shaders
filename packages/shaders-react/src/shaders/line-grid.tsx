import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  getShaderColorFromString,
  lineGridFragmentShader,
  LineGridShapes,
  ShaderFitOptions,
  type LineGridParams,
  type LineGridUniforms,
  type ShaderPreset,
  defaultPatternSizing,
} from '@paper-design/shaders';

export interface LineGridProps extends ShaderComponentProps, LineGridParams {}

type LineGridPreset = ShaderPreset<LineGridParams>;

export const defaultPreset: LineGridPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    colorBack: '#000000',
    colorFill: '#ffffff',
    colorStroke: '#ffaa00',
    size: 1,
    gapX: 32,
    gapY: 32,
    strokeWidth: 0,
    sizeRange: 0.5,
    opacityRange: 0,
    shape: 'horizontal',
  },
};

const barsPreset: LineGridPreset = {
  name: 'Bars',
  params: {
    ...defaultPatternSizing,
    colorBack: '#000000',
    colorFill: '#ffffff',
    colorStroke: '#808080',
    size: 6,
    gapX: 32,
    gapY: 32,
    strokeWidth: 1,
    sizeRange: 1,
    opacityRange: 0,
    shape: 'vertical',
  },
};

const gridPreset: LineGridPreset = {
  name: 'Grid',
  params: {
    ...defaultPatternSizing,
    colorBack: '#000000',
    colorFill: '#ffffff',
    colorStroke: '#808080',
    size: 0.5,
    gapX: 60,
    gapY: 60,
    strokeWidth: 1,
    sizeRange: 1,
    opacityRange: 0,
    shape: 'cross',
  },
};

const diagonalPreset: LineGridPreset = {
  name: 'Diagonal',
  params: {
    ...defaultPatternSizing,
    colorBack: '#000000',
    colorFill: '#ffffff',
    colorStroke: '#808080',
    size: 5,
    gapX: 70,
    gapY: 50,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 1,
    shape: 'diagonalForward',
  },
};

export const lineGridPresets: LineGridPreset[] = [defaultPreset, barsPreset, gridPreset, diagonalPreset];

export const LineGrid: React.FC<LineGridProps> = memo(function LineGridImpl({
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
}: LineGridProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFill: getShaderColorFromString(colorFill),
    u_colorStroke: getShaderColorFromString(colorStroke),
    u_size: size,
    u_gapX: gapX,
    u_gapY: gapY,
    u_strokeWidth: strokeWidth,
    u_sizeRange: sizeRange,
    u_opacityRange: opacityRange,
    u_shape: LineGridShapes[shape],

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
  } satisfies LineGridUniforms;

  return (
    <ShaderMount {...props} maxPixelCount={maxPixelCount} fragmentShader={lineGridFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
