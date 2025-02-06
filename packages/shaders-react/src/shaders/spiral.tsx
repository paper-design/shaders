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

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highmidIntensity bug)

export const defaultPreset: SpiralPreset = {
  name: 'Default',
  params: {
    color1: 'hsla(200, 60%, 95%, 1)',
    color2: 'hsla(340, 60%, 5%, 1)',
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
    blur: 0.01,
    irregular: 0,
    seed: 0,
  },
} as const;

export const dropletPreset: SpiralPreset = {
  name: 'Droplet',
  params: {
    color1: 'hsla(190, 50%, 95%, 1)',
    color2: 'hsla(320, 50%, 50%, 1)',
    scale: 0.65,
    offsetX: 0,
    offsetY: 0,
    speed: 1,
    focus: 0,
    noiseFreq: 0,
    noisePower: 0,
    strokeWidth: 0.95,
    midShape: 1,
    decrease: 0,
    blur: 0,
    irregular: 0,
    seed: 0,
  },
} as const;

export const sandPreset: SpiralPreset = {
  name: 'Sand',
  params: {
    color1: 'hsla(45, 25%, 69%, 1)',
    color2: 'hsla(0, 0%, 87%, 1)',
    scale: 4,
    offsetX: 0,
    offsetY: 0,
    speed: 0,
    focus: 0,
    noiseFreq: 4.5,
    noisePower: 0.4,
    strokeWidth: 0.15,
    midShape: 0,
    decrease: 0,
    blur: 0.5,
    irregular: 0,
    seed: 0,
  },
} as const;

export const swirlPreset: SpiralPreset = {
  name: 'Swirl',
  params: {
    color1: 'hsla(160, 50%, 80%, 1)',
    color2: 'hsla(220, 50%, 20%, 1)',
    scale: 4,
    offsetX: 0,
    offsetY: 0,
    speed: 1,
    focus: 0.8,
    noiseFreq: 0,
    noisePower: 0,
    strokeWidth: 0.5,
    midShape: 0,
    decrease: 0,
    blur: 0.5,
    irregular: 0,
    seed: 0,
  },
} as const;

export const hookPreset: SpiralPreset = {
  name: 'Hook',
  params: {
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(200, 50%, 70%, 1)',
    scale: 0.8,
    offsetX: 0,
    offsetY: 0,
    speed: 3,
    focus: 0,
    noiseFreq: 0,
    noisePower: 0,
    strokeWidth: 0.5,
    midShape: 0,
    decrease: 0.25,
    blur: 0.02,
    irregular: 0,
    seed: 0,
  },
} as const;

export const vinylPreset: SpiralPreset = {
  name: 'Vinyl',
  params: {
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(320, 5%, 75%, 1)',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    speed: 3,
    focus: 0,
    noiseFreq: 0,
    noisePower: 0,
    strokeWidth: 0.95,
    midShape: 1,
    decrease: 0,
    blur: 0.11,
    irregular: .3,
    seed: 0,
  },
} as const;

export const spiralPresets: SpiralPreset[] = [defaultPreset, dropletPreset, swirlPreset, sandPreset, hookPreset, vinylPreset];

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
