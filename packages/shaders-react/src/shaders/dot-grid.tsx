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
  colorBack?: string;
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
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colorFill: 'hsla(0, 0%, 100%, 1)',
    colorStroke: 'hsla(40, 100%, 50%, 1)',
    dotSize: 2,
    gridSpacingX: 50,
    gridSpacingY: 50,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 0,
    shape: DotGridShapes.Circle,
  },
};

export const macrodataPreset: DotGridPreset = {
  name: 'Macrodata',
  params: {
    colorBack: 'hsla(211, 37%, 13%, 1)',
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
    colorBack: 'hsla(0, 0%, 100%, 1)',
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
};

const bubblesPreset: DotGridPreset = {
  name: 'Bubbles',
  params: {
    colorBack: 'hsla(234, 100%, 31%, .5)',
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
};

const treeLinePreset: DotGridPreset = {
  name: 'Tree line',
  params: {
    colorBack: 'hsla(100, 100%, 36%, .05)',
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
};

const diamondsPreset: DotGridPreset = {
  name: 'Diamonds',
  params: {
    colorBack: 'hsla(0, 0%, 0%, 0)',
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
};

const wallpaperPreset: DotGridPreset = {
  name: 'Wallpaper',
  params: {
    colorBack: 'hsla(154, 33%, 19%, 1)',
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
};

const matrixPreset: DotGridPreset = {
  name: 'Enter the Matrix',
  params: {
    colorBack: 'hsla(0, 100%, 0%, 1)',
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
};

const waveformPreset: DotGridPreset = {
  name: 'Waveform',
  params: {
    colorBack: 'hsla(0, 100%, 100%, 1)',
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

export const DotGrid = ({
  colorBack,
  colorFill,
  colorStroke,
  dotSize,
  gridSpacingX,
  gridSpacingY,
  strokeWidth,
  sizeRange,
  opacityRange,
  shape,
  maxResolution = 6016 * 3384, // Higher max resolution for this shader
  ...props
}: DotGridProps): React.ReactElement => {
  const uniforms: DotGridUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(colorBack, defaultPreset.params.colorBack),
      u_colorFill: getShaderColorFromString(colorFill, defaultPreset.params.colorFill),
      u_colorStroke: getShaderColorFromString(colorStroke, defaultPreset.params.colorStroke),
      u_dotSize: dotSize ?? defaultPreset.params.dotSize,
      u_gridSpacingX: gridSpacingX ?? defaultPreset.params.gridSpacingX,
      u_gridSpacingY: gridSpacingY ?? defaultPreset.params.gridSpacingY,
      u_strokeWidth: strokeWidth ?? defaultPreset.params.strokeWidth,
      u_sizeRange: sizeRange ?? defaultPreset.params.sizeRange,
      u_opacityRange: opacityRange ?? defaultPreset.params.opacityRange,
      u_shape: shape ?? defaultPreset.params.shape,
    };
  }, [
    colorBack,
    colorFill,
    colorStroke,
    dotSize,
    gridSpacingX,
    gridSpacingY,
    strokeWidth,
    sizeRange,
    opacityRange,
    shape,
  ]);

  return (
    <ShaderMount {...props} maxResolution={maxResolution} fragmentShader={dotGridFragmentShader} uniforms={uniforms} />
  );
};
