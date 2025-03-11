import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, ditheringFragmentShader, type DitheringUniforms } from '@paper-design/shaders';

export type DitheringParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  ditheringRes?: number;
  numColors?: number;
  pxSize?: number;
} & GlobalParams;

export type DitheringProps = Omit<ShaderMountProps, 'fragmentShader'> & DitheringParams;

type DitheringPreset = { name: string; params: Required<DitheringParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: DitheringPreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.15,
    seed: 0,
    color1: 'hsla(208, 50%, 15%, 1)',
    color2: 'hsla(94, 50%, 75%, 1)',
    ditheringRes: 6,
    numColors: 4,
    pxSize: 7,
  },
} as const;

export const ditheringPresets: DitheringPreset[] = [defaultPreset];

export const Dithering = (props: DitheringProps): JSX.Element => {
  const uniforms: DitheringUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_ditheringRes: props.ditheringRes ?? defaultPreset.params.ditheringRes,
      u_numColors: props.numColors ?? defaultPreset.params.numColors,
      u_pxSize: props.pxSize ?? defaultPreset.params.pxSize,
    };
  }, [
    props.scale,
    props.color1,
    props.color2,
    props.ditheringRes,
    props.numColors,
    props.pxSize,
  ]);

  return <ShaderMount {...props} fragmentShader={ditheringFragmentShader} uniforms={uniforms} />;
};
