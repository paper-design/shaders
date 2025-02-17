import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  gradientBorderFragmentShader,
  type GradientBorderUniforms,
} from '@paper-design/shaders';

export type GradientBorderParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  inner?: number;
  borderLine?: number;
  power?: number;
  spotty?: number;
  grain?: number;
  sizePx?: number;
} & GlobalParams;

export type GradientBorderProps = Omit<ShaderMountProps, 'fragmentShader'> & GradientBorderParams;

type GradientBorderPreset = { name: string; params: Required<GradientBorderParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: GradientBorderPreset = {
  name: 'Default',
  params: {
    speed: 0.8,
    seed: 0,
    colorBack: 'hsla(200, 0%, 0%, 1)',
    color1: 'hsla(30, 100%, 50%, 1)',
    color2: 'hsla(240, 100%, 50%, 1)',
    color3: 'hsla(320, 100%, 50%, 1)',
    inner: 0.86,
    borderLine: 0.15,
    power: 1,
    spotty: 1,
    grain: 0,
    sizePx: 120,
  },
} as const;

export const preset1: GradientBorderPreset = {
  name: 'Preset #1',
  params: {
    speed: 1,
    seed: 0,
    colorBack: 'hsla(76, 48%, 10%, 1)',
    color1: 'hsla(76, 86%, 34%, 1)',
    color2: 'hsla(199, 100%, 50%, 1)',
    color3: 'hsla(331, 100%, 63%, 1)',
    inner: 0,
    borderLine: 1,
    power: 1,
    spotty: 1,
    grain: 0,
    sizePx: 25,
  },
} as const;

export const preset2: GradientBorderPreset = {
  name: 'Preset #2',
  params: {
    speed: 0.2,
    seed: 0,
    colorBack: 'hsla(260, 80%, 96%, 1)',
    color1: 'hsla(174, 72%, 56%, 1)',
    color2: 'hsla(33, 100%, 50%, 1)',
    color3: 'hsla(330, 100%, 50%, 1)',
    inner: 0,
    borderLine: 0.2,
    power: 1,
    spotty: 0.5,
    grain: 1,
    sizePx: 130,
  },
} as const;

export const preset3: GradientBorderPreset = {
  name: 'Preset #3',
  params: {
    speed: 0.2,
    seed: 0,
    colorBack: 'hsla(358, 94%, 36%, 1)',
    color1: 'hsla(32, 100%, 50%, 1)',
    color2: 'hsla(40, 82%, 67%, 1)',
    color3: 'hsla(26, 26%, 83%, 1)',
    inner: 1,
    borderLine: 0.33,
    power: 0,
    spotty: 0,
    grain: 0.38,
    sizePx: 250,
  },
} as const;

export const gradientBorderPresets: GradientBorderPreset[] = [defaultPreset, preset1, preset2, preset3] as const;

export const GradientBorder = (props: GradientBorderProps): JSX.Element => {
  const uniforms: GradientBorderUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_inner: props.inner ?? defaultPreset.params.inner,
      u_borderLine: props.borderLine ?? defaultPreset.params.borderLine,
      u_power: props.power ?? defaultPreset.params.power,
      u_spotty: props.spotty ?? defaultPreset.params.spotty,
      u_grain: props.grain ?? defaultPreset.params.grain,
      u_sizePx: props.sizePx ?? defaultPreset.params.sizePx,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.color3,
    props.sizePx,
    props.inner,
    props.borderLine,
    props.power,
    props.spotty,
    props.grain,
  ]);

  return <ShaderMount {...props} fragmentShader={gradientBorderFragmentShader} uniforms={uniforms} />;
};
