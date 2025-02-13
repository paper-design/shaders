import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  pulsingBorderFragmentShader,
  type PulsingBorderUniforms,
} from '@paper-design/shaders';

export type PulsingBorderParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  brightness?: number;
  midOpacity?: number;
  borderPower?: number;
  borderBlur?: number;
  borderSize?: number;
} & GlobalParams;

export type PulsingBorderProps = Omit<ShaderMountProps, 'fragmentShader'> & PulsingBorderParams;

type PulsingBorderPreset = { name: string; params: Required<PulsingBorderParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: PulsingBorderPreset = {
  name: 'Default',
  params: {
    speed: .5,
    seed: 0,
    colorBack: 'hsla(200, 0%, 7%, 1)',
    color1: 'hsla(200, 100%, 50%, 1)',
    color2: 'hsla(240, 100%, 50%, 1)',
    color3: 'hsla(320, 100%, 50%, 1)',
    brightness: .2,
    // midOpacity: .3,
    midOpacity: .1,
    borderPower: 0.25,
    borderBlur: .5,
    borderSize: 150,
  },
} as const;

export const pulsingBorderPresets: PulsingBorderPreset[] = [defaultPreset] as const;

export const PulsingBorder = (props: PulsingBorderProps): JSX.Element => {
  const uniforms: PulsingBorderUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_brightness: props.brightness ?? defaultPreset.params.brightness,
      u_midOpacity: props.midOpacity ?? defaultPreset.params.midOpacity,
      u_borderPower: props.borderPower ?? defaultPreset.params.borderPower,
      u_borderBlur: props.borderBlur ?? defaultPreset.params.borderBlur,
      u_borderSize: props.borderSize ?? defaultPreset.params.borderSize,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.color3,
    props.brightness,
    props.midOpacity,
    props.borderPower,
    props.borderBlur,
    props.borderSize,
  ]);

  return <ShaderMount {...props} fragmentShader={pulsingBorderFragmentShader} uniforms={uniforms} />;
};
