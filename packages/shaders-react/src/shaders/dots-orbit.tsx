import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, dotsOrbitFragmentShader, type DotsOrbitUniforms } from '@paper-design/shaders';

export type DotsOrbitParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  dotSize?: number;
  dotSizeRange?: number;
  spreading?: number;
} & GlobalParams;

export type DotsOrbitProps = Omit<ShaderMountProps, 'fragmentShader'> & DotsOrbitParams;

type DotsOrbitPreset = { name: string; params: Required<DotsOrbitParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: DotsOrbitPreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 2,
    seed: 0,
    color1: 'hsla(358, 66%, 49%, 1)',
    color2: 'hsla(145, 30%, 33%, 1)',
    color3: 'hsla(39, 88%, 52%, 1)',
    color4: 'hsla(274, 30%, 35%, 1)',
    dotSize: 0.7,
    dotSizeRange: 0.4,
    spreading: 1,
  },
} as const;

export const dotsOrbitPresets: DotsOrbitPreset[] = [defaultPreset];

export const DotsOrbit = (props: DotsOrbitProps): JSX.Element => {
  const uniforms: DotsOrbitUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
      u_dotSize: props.dotSize ?? defaultPreset.params.dotSize,
      u_dotSizeRange: props.dotSizeRange ?? defaultPreset.params.dotSizeRange,
      u_spreading: props.spreading ?? defaultPreset.params.spreading,
    };
  }, [
    props.scale,
    props.color1,
    props.color2,
    props.color3,
    props.color4,
    props.dotSize,
    props.dotSizeRange,
    props.spreading,
  ]);

  return <ShaderMount {...props} fragmentShader={dotsOrbitFragmentShader} uniforms={uniforms} />;
};
