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
    gridSpacingX: 75,
    gridSpacingY: 75,
    strokeWidth: 0,
    sizeRange: 0,
    opacityRange: 0,
  },
} as const;

export const dotsGridPresets: DotsGridPreset[] = [defaultPreset];

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
  ]);

  return <ShaderMount {...props} fragmentShader={dotsGridFragmentShader} uniforms={uniforms} />;
};
