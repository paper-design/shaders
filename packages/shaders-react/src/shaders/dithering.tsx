import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, ditheringFragmentShader, type DitheringUniforms } from '@paper-design/shaders';

export type DitheringParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
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
    color1: 'hsla(208, 25%, 45%, 1)',
    color2: 'hsla(94, 38%, 59%, 1)',
    color3: 'hsla(359, 94%, 62%, 1)',
    color4: 'hsla(42, 93%, 64%, 1)',
    color5: 'hsla(0, 0%, 100%, 1)',
    ditheringRes: 0.5,
    numColors: 4,
    pxSize: 2,
  },
} as const;

export const ditheringPresets: DitheringPreset[] = [defaultPreset];

export const Dithering = (props: DitheringProps): JSX.Element => {
  const uniforms: DitheringUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
      u_color5: getShaderColorFromString(props.color5, defaultPreset.params.color5),
      u_ditheringRes: props.ditheringRes ?? defaultPreset.params.ditheringRes,
      u_numColors: props.numColors ?? defaultPreset.params.numColors,
      u_pxSize: props.pxSize ?? defaultPreset.params.pxSize,
    };
  }, [
    props.scale,
    props.color1,
    props.color2,
    props.color3,
    props.color4,
    props.color5,
    props.ditheringRes,
    props.numColors,
    props.pxSize,
  ]);

  return <ShaderMount {...props} fragmentShader={ditheringFragmentShader} uniforms={uniforms} />;
};
