import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  borderGradientFragmentShader,
  type BorderGradientUniforms,
} from '@paper-design/shaders';

export type BorderGradientParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  blur?: number;
  grainDistortion?: number;
  sandGrain?: number;
  pxSize?: number;
  offsetX?: number;
  offsetY?: number;
  scaleX?: number;
  scaleY?: number;
};

export type BorderGradientProps = Omit<ShaderMountProps, 'fragmentShader'> & BorderGradientParams;

type BorderGradientPreset = { name: string; params: Required<BorderGradientParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: BorderGradientPreset = {
  name: 'Default',
  params: {
    colorBack: 'hsla(0, 100%, 2%, 1)',
    color1: 'hsla(32, 89%, 40%, 1)',
    color2: 'hsla(46, 60%, 60%, 1)',
    color3: 'hsla(39, 28%, 81%, 1)',
    offsetX: 0,
    offsetY: 0,
    scaleX: 0,
    scaleY: 0,
    pxSize: 150,
    blur: 0.35,
    grainDistortion: 0.15,
    sandGrain: 0.5,
  },
} as const;

export const borderGradientPresets: BorderGradientPreset[] = [defaultPreset] as const;

export const BorderGradient = (props: BorderGradientProps): JSX.Element => {
  const uniforms: BorderGradientUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_offsetX: props.offsetX ?? defaultPreset.params.offsetX,
      u_offsetY: props.offsetY ?? defaultPreset.params.offsetY,
      u_scaleX: props.scaleX ?? defaultPreset.params.scaleX,
      u_scaleY: props.scaleY ?? defaultPreset.params.scaleY,
      u_blur: props.blur ?? defaultPreset.params.blur,
      u_grainDistortion: props.grainDistortion ?? defaultPreset.params.grainDistortion,
      u_sandGrain: props.sandGrain ?? defaultPreset.params.sandGrain,
      u_pxSize: props.pxSize ?? defaultPreset.params.pxSize,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.color3,
    props.offsetX,
    props.offsetY,
    props.scaleX,
    props.scaleY,
    props.pxSize,
    props.blur,
    props.grainDistortion,
    props.sandGrain,
  ]);

  return <ShaderMount {...props} fragmentShader={borderGradientFragmentShader} uniforms={uniforms} />;
};
