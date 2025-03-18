import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import {
  dotGridFragmentShader,
  getShaderColorFromString,
  type DotGridUniforms,
  type DotGridShape,
  DotGridShapes,
} from '@paper-design/shaders';

export type DotGridParams = {
  colorFill?: string;
  colorStroke?: string;
  dotSize?: number;
  gridSpacingX?: number;
  gridSpacingY?: number;
  strokeWidth?: number;
  sizeRange?: number;
  opacityRange?: number;
  shape?: DotGridShape;
};

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export type DotGridProps = Omit<ShaderMountProps, 'fragmentShader'> & DotGridParams;

type DotGridPreset = { name: string; params: Required<DotGridParams> };

export const defaultPreset: DotGridPreset = {
  name: 'Default',
  params: {
    colorFill: 'hsla(145, 30%, 10%, 1)',
    colorStroke: 'hsla(39, 88%, 52%, 1)',
    dotSize: 2,
    gridSpacingX: 50,
    gridSpacingY: 50,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 0,
    shape: DotGridShapes.Circle,
  },
} as const;

export const macrodataPreset: DotGridPreset = {
  name: 'Macrodata',
  params: {
    colorFill: 'hsla(218, 100%, 67%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 3,
    gridSpacingX: 25,
    gridSpacingY: 25,
    strokeWidth: 0,
    sizeRange: 0.25,
    opacityRange: 0.9,
    shape: DotGridShapes.Circle,
  },
};

const trianglesPreset: DotGridPreset = {
  name: 'Triangles',
  params: {
    colorFill: 'hsla(0, 0%, 100%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, .5)',
    dotSize: 5,
    gridSpacingX: 32,
    gridSpacingY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: DotGridShapes.Triangle,
  },
} as const;

const bubblesPreset: DotGridPreset = {
  name: 'Bubbles',
  params: {
    colorFill: 'hsla(100, 30%, 100%, 1)',
    colorStroke: 'hsla(0, 100%, 0%, 1)',
    dotSize: 28,
    gridSpacingX: 60,
    gridSpacingY: 60,
    strokeWidth: 12,
    sizeRange: 0.7,
    opacityRange: 1.3,
    shape: DotGridShapes.Circle,
  },
} as const;

const treeLinePreset: DotGridPreset = {
  name: 'Tree line',
  params: {
    colorFill: 'hsla(150, 80%, 10%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 8,
    gridSpacingX: 20,
    gridSpacingY: 90,
    strokeWidth: 0,
    sizeRange: 1,
    opacityRange: 0.6,
    shape: DotGridShapes.Circle,
  },
} as const;

const diamondsPreset: DotGridPreset = {
  name: 'Diamonds',
  params: {
    colorFill: 'hsla(0, 100%, 50%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 15,
    gridSpacingX: 30,
    gridSpacingY: 30,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 2,
    shape: DotGridShapes.Diamond,
  },
} as const;

const wallpaperPreset: DotGridPreset = {
  name: 'Wallpaper',
  params: {
    colorFill: 'hsla(0, 0%, 0%, 0)',
    colorStroke: 'hsla(36, 48%, 58%, 1)',
    dotSize: 9,
    gridSpacingX: 32,
    gridSpacingY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: DotGridShapes.Diamond,
  },
} as const;

const matrixPreset: DotGridPreset = {
  name: 'Enter the Matrix',
  params: {
    colorFill: 'hsla(182, 100%, 64%, 1)',
    colorStroke: 'hsla(0, 100%, 100%, 0)',
    dotSize: 2,
    gridSpacingX: 10,
    gridSpacingY: 10,
    strokeWidth: 0.5,
    sizeRange: 0.25,
    opacityRange: 1,
    shape: DotGridShapes.Triangle,
  },
} as const;

const waveformPreset: DotGridPreset = {
  name: 'Waveform',
  params: {
    colorFill: 'hsla(227, 93%, 38%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 0)',
    dotSize: 100,
    gridSpacingX: 2,
    gridSpacingY: 215,
    strokeWidth: 0,
    sizeRange: 1,
    opacityRange: 0,
    shape: DotGridShapes.Square,
  },
} as const;

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

export const DotGrid = (props: DotGridProps): React.ReactElement => {
  const uniforms: DotGridUniforms = useMemo(() => {
    return {
      u_colorFill: getShaderColorFromString(props.colorFill, defaultPreset.params.colorStroke),
      u_colorStroke: getShaderColorFromString(props.colorStroke, defaultPreset.params.colorStroke),
      u_dotSize: props.dotSize ?? defaultPreset.params.dotSize,
      u_gridSpacingX: props.gridSpacingX ?? defaultPreset.params.gridSpacingX,
      u_gridSpacingY: props.gridSpacingY ?? defaultPreset.params.gridSpacingY,
      u_strokeWidth: props.strokeWidth ?? defaultPreset.params.strokeWidth,
      u_sizeRange: props.sizeRange ?? defaultPreset.params.sizeRange,
      u_opacityRange: props.opacityRange ?? defaultPreset.params.opacityRange,
      u_shape: props.shape ?? defaultPreset.params.shape,
    };
  }, [
    props.colorFill,
    props.colorStroke,
    props.dotSize,
    props.gridSpacingX,
    props.gridSpacingY,
    props.strokeWidth,
    props.sizeRange,
    props.opacityRange,
    props.shape,
  ]);

  return <ShaderMount {...props} fragmentShader={dotGridFragmentShader} uniforms={uniforms} />;
};
