import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, spiralFragmentShader, type SpiralUniforms } from '@paper-design/shaders';

export type SpiralParams = {
  color1?: string;
  color2?: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  focus?: number;
  noiseFreq?: number;
  noisePower?: number;
  strokeWidth?: number;
  midShape?: number;
  decrease?: number;
  blur?: number;
  irregular?: number;
} & GlobalParams;

export type SpiralProps = Omit<ShaderMountProps, 'fragmentShader'> & SpiralParams;

type SpiralPreset = { name: string; params: Required<SpiralParams> };

export const defaultPreset: SpiralPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(156, 46%, 51%, 1)',
    color2: 'hsla(189, 63%, 30%, 1)',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    speed: 1,
    focus: 0,
    noiseFreq: 0,
    noisePower: 0,
    strokeWidth: 0.5,
    midShape: 0,
    decrease: 0,
    blur: 0,
    irregular: 0,
    seed: 0,
  },
} as const;

export const spiralPresets: SpiralPreset[] = [defaultPreset];

export const Spiral = (props: SpiralProps): JSX.Element => {
  const uniforms: SpiralUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_offsetX: props.offsetX ?? defaultPreset.params.offsetX,
      u_offsetY: props.offsetY ?? defaultPreset.params.offsetY,
      u_focus: props.focus ?? defaultPreset.params.focus,
      u_noiseFreq: props.noiseFreq ?? defaultPreset.params.noiseFreq,
      u_noisePower: props.noisePower ?? defaultPreset.params.noisePower,
      u_strokeWidth: props.strokeWidth ?? defaultPreset.params.strokeWidth,
      u_midShape: props.midShape ?? defaultPreset.params.midShape,
      u_decrease: props.decrease ?? defaultPreset.params.decrease,
      u_blur: props.blur ?? defaultPreset.params.blur,
      u_irregular: props.irregular ?? defaultPreset.params.irregular,
      u_seed: props.seed ?? defaultPreset.params.seed,
    };
  }, [
    props.color1,
    props.color2,
    props.scale,
    props.offsetX,
    props.offsetY,
    props.focus,
    props.noiseFreq,
    props.noisePower,
    props.strokeWidth,
    props.midShape,
    props.decrease,
    props.blur,
    props.irregular,
    props.seed,
  ]);

  return <ShaderMount {...props} fragmentShader={spiralFragmentShader} uniforms={uniforms} />;
};
