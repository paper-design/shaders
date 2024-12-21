import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, dotsGridFragmentShader, type DotsGridUniforms } from '@paper-design/shaders';

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
  shape?: number;
};

export type DotsGridProps = Omit<ShaderMountProps, 'fragmentShader'> & DotsGridParams;

type DotsGridPreset = { name: string; params: Required<DotsGridParams> };

export const defaultPreset: DotsGridPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(358.2, 66.1%, 48.6%, 0)',
    colorFill: 'hsla(145.2, 30.1%, 32.5%, 1)',
    colorStroke: 'hsla(39.4, 87.7%, 52.4%, 1)',
    dotSize: 2,
    gridSpacingX: 50,
    gridSpacingY: 50,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 0,
    shape: 0,
  },
} as const;

const preset1: DotsGridPreset = {
  name: '1',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(234, 100%, 31%, .5)',
    colorFill: 'hsla(100, 30.1%, 100%, 1)',
    colorStroke: 'hsla(0, 100%, 50%, .4)',
    dotSize: 28,
    gridSpacingX: 60,
    gridSpacingY: 60,
    strokeWidth: 7,
    sizeRange: .5,
    opacityRange: 1,
    shape: 0,
  },
} as const;

const preset2: DotsGridPreset = {
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
    sizeRange: .35,
    opacityRange: .55,
    shape: 0,
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
    opacityRange: .6,
    shape: 0,
  },
} as const;

const preset4: DotsGridPreset = {
  name: '4',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorBack: 'hsla(40, 100%, 36%, .3)',
    colorFill: 'hsla(50, 50%, 50%, 1)',
    colorStroke: 'hsla(0, 0%, 0%, 1)',
    dotSize: 42,
    gridSpacingX: 75,
    gridSpacingY: 75,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 1,
    shape: 0,
  },
} as const;

export const dotsGridPresets: DotsGridPreset[] = [defaultPreset, preset1, preset2, preset3, preset4];

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
