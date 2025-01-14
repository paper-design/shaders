import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import {
  dotsGridFragmentShader,
  getShaderColorFromString,
  type DotsGridUniforms,
  type DotsGridShape,
  DotsGridShapes,
} from '@paper-design/shaders';

export type DotsGridParams = {
  colorBack?: string;
  colorFill?: string;
  colorStroke?: string;
  dotSize?: number;
  gridSpacingX?: number;
  gridSpacingY?: number;
  strokeWidth?: number;
  sizeRange?: number;
  opacityRange?: number;
  shape?: DotsGridShape;
};

export type DotsGridProps = Omit<ShaderMountProps, 'fragmentShader'> & DotsGridParams;

type DotsGridPreset = { name: string; params: Required<DotsGridParams> };

export const defaultPreset: DotsGridPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(358.2, 66.1%, 48.6%, 0)',
    colorFill: 'hsla(145.2, 30.1%, 10%, 1)',
    colorStroke: 'hsla(39.4, 87.7%, 52.4%, 1)',
    dotSize: 2,
    gridSpacingX: 50,
    gridSpacingY: 50,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 0,
    shape: DotsGridShapes.Circle,
  },
} as const;

const preset1: DotsGridPreset = {
  name: '1',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(0, 0%, 100%, 1)',
    colorFill: 'hsla(0, 0%, 100%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, .5)',
    dotSize: 5,
    gridSpacingX: 32,
    gridSpacingY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: DotsGridShapes.Triangle,
  },
} as const;

const preset2: DotsGridPreset = {
  name: '2',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(234, 100%, 31%, .5)',
    colorFill: 'hsla(100, 30.1%, 100%, 1)',
    colorStroke: 'hsla(0, 100%, 0%, 1)',
    dotSize: 28,
    gridSpacingX: 60,
    gridSpacingY: 60,
    strokeWidth: 12,
    sizeRange: 0.7,
    opacityRange: 1.3,
    shape: DotsGridShapes.Circle,
  },
} as const;

const preset3: DotsGridPreset = {
  name: '3',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(100, 100%, 36%, .05)',
    colorFill: 'hsla(150, 80%, 10%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 8,
    gridSpacingX: 20,
    gridSpacingY: 90,
    strokeWidth: 0,
    sizeRange: 1,
    opacityRange: 0.6,
    shape: DotsGridShapes.Circle,
  },
} as const;

const preset4: DotsGridPreset = {
  name: '4',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(0, 0%, 0%, 0)',
    colorFill: 'hsla(0, 100%, 50%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 15,
    gridSpacingX: 30,
    gridSpacingY: 30,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 2,
    shape: DotsGridShapes.Diamond,
  },
} as const;

const preset5: DotsGridPreset = {
  name: '5',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(154, 33%, 19%, 1)',
    colorFill: 'hsla(0, 0%, 0%, 0)',
    colorStroke: 'hsla(36, 48%, 58%, 1)',
    dotSize: 9,
    gridSpacingX: 32,
    gridSpacingY: 32,
    strokeWidth: 1,
    sizeRange: 0,
    opacityRange: 0,
    shape: DotsGridShapes.Diamond,
  },
} as const;

const preset6: DotsGridPreset = {
  name: '6',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(0, 100%, 0%, 1)',
    colorFill: 'hsla(182, 100%, 64%, 1)',
    colorStroke: 'hsla(0, 100%, 100%, 0)',
    dotSize: 2,
    gridSpacingX: 10,
    gridSpacingY: 10,
    strokeWidth: 0.5,
    sizeRange: 0.25,
    opacityRange: 1,
    shape: DotsGridShapes.Triangle,
  },
} as const;

const preset7: DotsGridPreset = {
  name: '7',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(0, 100%, 100%, 1)',
    colorFill: 'hsla(227, 93%, 38%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 0)',
    dotSize: 100,
    gridSpacingX: 2,
    gridSpacingY: 215,
    strokeWidth: 0,
    sizeRange: 1,
    opacityRange: 0,
    shape: DotsGridShapes.Square,
  },
} as const;

export const dotsGridPresets: DotsGridPreset[] = [
  defaultPreset,
  preset1,
  preset2,
  preset3,
  preset4,
  preset5,
  preset6,
  preset7,
];

export const DotsGrid = (props: DotsGridProps): JSX.Element => {
  const uniforms: DotsGridUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
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
    props.colorBack,
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

  return <ShaderMount {...props} fragmentShader={dotsGridFragmentShader} uniforms={uniforms} />;
};
