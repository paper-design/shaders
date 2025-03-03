import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, swirlFragmentShader, type SwirlUniforms } from '@paper-design/shaders';

export type SwirlParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  offsetX?: number;
  offsetY?: number;
  bandCount?: number;
  twist?: number;
  depth?: number;
  noiseFreq?: number;
  noise?: number;
  blur?: number;
  reverse?: boolean;
} & GlobalParams;

export type SwirlProps = Omit<ShaderMountProps, 'fragmentShader'> & SwirlParams;

type SwirlPreset = { name: string; params: Required<SwirlParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highmidIntensity bug)

export const defaultPreset: SwirlPreset = {
  name: 'Default',
  params: {
    color1: 'hsla(45, 100%, 70%, 1)',
    color2: 'hsla(200, 80%, 65%, 1)',
    color3: 'hsla(280, 90%, 60%, 1)',
    offsetX: 0,
    offsetY: 0,
    bandCount: 2.5,
    twist: 0.2,
    depth: 1,
    noiseFreq: 3,
    noise: 0.37,
    blur: 0,
    speed: 0,
    reverse: false,
    seed: 0,
  },
} as const;

export const openingPreset: SwirlPreset = {
  name: 'Opening',
  params: {
    color1: 'hsla(225, 60%, 27%, 1)',
    color2: 'hsla(308, 40%, 36%, 1)',
    color3: 'hsla(340, 55%, 55%, 1)',
    offsetX: -0.4,
    offsetY: 0.5,
    bandCount: 8,
    twist: 0.6,
    depth: 0.6,
    noiseFreq: 0,
    noise: 0,
    blur: 0,
    speed: 1,
    reverse: false,
    seed: 0,
  },
} as const;

export const jamesBondPreset: SwirlPreset = {
  name: '007',
  params: {
    color1: 'hsla(0, 0%, 100%, 1)',
    color2: 'hsla(0, 0%, 15%, 1)',
    color3: 'hsla(0, 0%, 0%, 1)',
    offsetX: 0,
    offsetY: 0,
    bandCount: 8,
    twist: 0.8,
    depth: 0.6,
    noiseFreq: 0,
    noise: 0,
    blur: 0,
    speed: 2,
    reverse: true,
    seed: 0,
  },
} as const;

export const sunPreset: SwirlPreset = {
  name: 'Sun',
  params: {
    color1: 'hsla(45, 100%, 80%, 1)',
    color2: 'hsla(15, 100%, 50%, 1)',
    color3: 'hsla(30, 100%, 65%, 1)',
    offsetX: 0.0,
    offsetY: 0.0,
    bandCount: 0.0,
    twist: 1.0,
    depth: 0.0,
    noiseFreq: 50.0,
    noise: 0.29,
    blur: 1.0,
    speed: 0.0,
    reverse: false,
    seed: 0,
  },
} as const;

export const swirlPresets: SwirlPreset[] = [defaultPreset, openingPreset, jamesBondPreset, sunPreset];

export const Swirl = (props: SwirlProps): JSX.Element => {
  const uniforms: SwirlUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_offsetX: props.offsetX ?? defaultPreset.params.offsetX,
      u_offsetY: props.offsetY ?? defaultPreset.params.offsetY,
      u_bandCount: props.bandCount ?? defaultPreset.params.bandCount,
      u_twist: props.twist ?? defaultPreset.params.twist,
      u_depth: props.depth ?? defaultPreset.params.depth,
      u_noiseFreq: props.noiseFreq ?? defaultPreset.params.noiseFreq,
      u_noise: props.noise ?? defaultPreset.params.noise,
      u_blur: props.blur ?? defaultPreset.params.blur,
    };
  }, [
    props.color1,
    props.color2,
    props.color3,
    props.offsetX,
    props.offsetY,
    props.bandCount,
    props.twist,
    props.depth,
    props.noiseFreq,
    props.noise,
    props.blur,
  ]);

  return <ShaderMount {...props} fragmentShader={swirlFragmentShader} uniforms={uniforms} />;
};
