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
    colorStroke: '#ffaa00',
    size: 0.2,
    gapX: 32,
    gapY: 32,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 0,
    shape: 'circle',
    angle: 0,
    angleRange: 0,
    shiftX: 0,
    shiftY: 0,
    rowShift: 0,
    rowShiftRange: 0,
  },
};

const trianglesPreset: DotGridPreset = {
  name: 'Triangles',
  params: {
    ...defaultPatternSizing,
    colorBack: '#ffffff',
    colorFill: '#ffffff',
    colorStroke: '#808080',
    size: 0.3,
    gapX: 32,
    gapY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: 'triangle',
    angle: 0,
    angleRange: 0,
    shiftX: 0,
    shiftY: 0,
    rowShift: 0,
    rowShiftRange: 0,
  },
};

const treeLinePreset: DotGridPreset = {
  name: 'Tree line',
  params: {
    ...defaultPatternSizing,
    colorBack: '#f4fce7',
    colorFill: '#052e19',
    colorStroke: '#000000',
    size: 0.8,
    gapX: 20,
    gapY: 90,
    strokeWidth: 0,
    sizeRange: 1,
    opacityRange: 0.6,
    shape: 'circle',
    angle: 0,
    angleRange: 0,
    shiftX: 0,
    shiftY: 0,
    rowShift: 0,
    rowShiftRange: 0,
  },
};

const wallpaperPreset: DotGridPreset = {
  name: 'Wallpaper',
  params: {
    ...defaultPatternSizing,
    colorBack: '#204030',
    colorFill: '#000000',
    colorStroke: '#bd955b',
    size: 0.55,
    gapX: 32,
    gapY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: 'diamond',
    angle: 0,
    angleRange: 0,
    shiftX: 0,
    shiftY: 0,
    rowShift: 0.5,
    rowShiftRange: 0,
  },
};

const snowPreset: DotGridPreset = {
  name: 'Snow',
  params: {
    ...defaultPatternSizing,
    colorBack: '#1b1e31',
    colorFill: '#ffffff',
    colorStroke: '#000000',
    size: 0.6,
    gapX: 30,
    gapY: 55,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 1,
    shape: 'asterisk',
    angle: 0,
    angleRange: 1,
    shiftX: 0,
    shiftY: 0,
    rowShift: 0,
    rowShiftRange: 0,
  },
};

const bricksPreset: DotGridPreset = {
  name: 'Bricks',
  params: {
    ...defaultPatternSizing,
    colorBack: '#ff9e9e',
    colorFill: '#00ffb3',
    colorStroke: '#000000',
    size: 0.2,
    gapX: 70,
    gapY: 70,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: .05,
    shape: 'rect',
    angle: 0,
    angleRange: 1,
    shiftX: 0,
    shiftY: 0,
    rowShift: 0.5,
    rowShiftRange: 0.25,
  },
};

const starsPreset: DotGridPreset = {
  name: 'Stars',
  params: {
    ...defaultPatternSizing,
    colorBack: '#000000',
    colorFill: '#ff0a78',
    colorStroke: '#ffee00',
    size: 0.5,
    gapX: 70,
    gapY: 70,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: .05,
    shape: 'star',
    angle: 0,
    angleRange: 1,
    shiftX: 0,
    shiftY: 0,
    rowShift: 0,
    rowShiftRange: 0,
  },
};

const cellsPreset: DotGridPreset = {
  name: 'Cells',
  params: {
    ...defaultPatternSizing,
    colorBack: '#ffffff00',
    colorFill: '#94d2ff',
    colorStroke: '#203979',
    size: 0.15,
    gapX: 80,
    gapY: 55,
    strokeWidth: 4,
    sizeRange: 0,
    opacityRange: .05,
    shape: 'cross',
    angle: 0,
    angleRange: 0,
    shiftX: 0,
    shiftY: 0,
    rowShift: 0,
    rowShiftRange: 0,
    rotation: 148
  },
};

export const dotGridPresets: DotGridPreset[] = [defaultPreset, trianglesPreset, treeLinePreset, wallpaperPreset, snowPreset, bricksPreset, starsPreset, cellsPreset];

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
  angle = defaultPreset.params.angle,
  angleRange = defaultPreset.params.angleRange,
  shiftX = defaultPreset.params.shiftX,
  shiftY = defaultPreset.params.shiftY,
  rowShift = defaultPreset.params.rowShift,
  rowShiftRange = defaultPreset.params.rowShiftRange,

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
    u_angle: angle,
    u_angleRange: angleRange,
    u_shiftX: shiftX,
    u_shiftY: shiftY,
    u_rowShift: rowShift,
    u_rowShiftRange: rowShiftRange,

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
