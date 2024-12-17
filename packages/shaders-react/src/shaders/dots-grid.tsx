import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, dotsGridFragmentShader, type DotsGridUniforms } from '@paper-design/shaders';

export type DotsGridParams = {
  dotSize?: number;
  gridSpacingX?: number;
  gridSpacingY?: number;
  scale?: number;
};

export type DotsGridProps = Omit<ShaderMountProps, 'fragmentShader'> & DotsGridParams;

type DotsGridPreset = { name: string; params: Required<DotsGridParams> };

export const defaultPreset: DotsGridPreset = {
  name: 'Default',
  params: {
    dotSize: 0.15,
    gridSpacingX: 2,
    gridSpacingY: 1,
    scale: 10,
  },
} as const;

export const dotsGridPresets: DotsGridPreset[] = [defaultPreset];

export const DotsGrid = (props: DotsGridProps): JSX.Element => {
  const uniforms: DotsGridUniforms = useMemo(() => {
    return {
      u_dotSize: props.dotSize ?? defaultPreset.params.dotSize,
      u_gridSpacingX: props.gridSpacingX ?? defaultPreset.params.gridSpacingX,
      u_gridSpacingY: props.gridSpacingY ?? defaultPreset.params.gridSpacingY,
      u_scale: props.scale ?? defaultPreset.params.scale,
    };
  }, [
    props.dotSize,
    props.gridSpacingX,
    props.gridSpacingY,
    props.scale,
  ]);

  return <ShaderMount {...props} fragmentShader={dotsGridFragmentShader} uniforms={uniforms} />;
};
