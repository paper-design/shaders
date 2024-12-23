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

export type DotGridProps = Omit<ShaderMountProps, 'fragmentShader'> & DotGridParams;

type DotGridPreset = { name: string; params: Required<DotGridParams> };

export const defaultPreset: DotGridPreset = {
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
    shape: DotGridShapes.Circle,
  },
} as const;

const preset1: DotGridPreset = {
  name: '1',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(234, 100%, 31%, .5)',
    colorFill: 'hsla(100, 30.1%, 100%, 1)',
    colorStroke: 'hsla(0, 100%, 50%, .4)',
    dotSize: 28,
    gridSpacingX: 60,
    gridSpacingY: 60,
    strokeWidth: 3,
    sizeRange: 0.5,
    opacityRange: 1,
    shape: DotGridShapes.Circle,
  },
} as const;

const preset2: DotGridPreset = {
  name: '2',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(0, 100%, 36%, 1)',
    colorFill: 'hsla(100, 30.1%, 100%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 39,
    gridSpacingX: 35,
    gridSpacingY: 35,
    strokeWidth: 23,
    sizeRange: 0.35,
    opacityRange: 0.55,
    shape: DotGridShapes.Circle,
  },
} as const;

const preset3: DotGridPreset = {
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
    shape: DotGridShapes.Circle,
  },
} as const;

const preset4: DotGridPreset = {
  name: '4',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(150, 100%, 36%, .3)',
    colorFill: 'hsla(50, 50%, 50%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 55,
    gridSpacingX: 75,
    gridSpacingY: 75,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 1,
    shape: DotGridShapes.Diamond,
  },
} as const;

const preset5: DotGridPreset = {
  name: '5',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(0, 100%, 100%, .1)',
    colorFill: 'hsla(171, 50%, 50%, 1)',
    colorStroke: 'hsla(0, 100%, 100%, 1)',
    dotSize: 52,
    gridSpacingX: 75,
    gridSpacingY: 75,
    strokeWidth: 16,
    sizeRange: 0.6,
    opacityRange: 0.5,
    shape: DotGridShapes.Square,
  },
} as const;

export const dotGridPresets: DotGridPreset[] = [defaultPreset, preset1, preset2, preset3, preset4, preset5];

export const DotGrid = (props: DotGridProps): JSX.Element => {
  const uniforms: DotGridUniforms = useMemo(() => {
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

  return <ShaderMount {...props} fragmentShader={dotGridFragmentShader} uniforms={uniforms} />;
};
