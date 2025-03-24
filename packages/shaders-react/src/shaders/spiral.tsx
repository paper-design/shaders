import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, spiralFragmentShader, type SpiralUniforms } from '@paper-design/shaders';

export type SpiralParams = {
  color1?: string;
  color2?: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  spiralDensity?: number;
  spiralDistortion?: number;
  strokeWidth?: number;
  strokeTaper?: number;
  strokeCap?: number;
  noiseFreq?: number;
  noisePower?: number;
  softness?: number;
} & GlobalParams;

export type SpiralProps = Omit<ShaderMountProps, 'fragmentShader'> & SpiralParams;

type SpiralPreset = { name: string; params: Required<SpiralParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highmidIntensity bug)

export const defaultPreset: SpiralPreset = {
  name: 'Default',
  params: {
    color1: 'hsla(0, 0%, 90%, 1)',
    color2: 'hsla(0, 0%, 25%, 1)',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    spiralDensity: 0,
    spiralDistortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noiseFreq: 0,
    noisePower: 0,
    softness: 0.01,
    speed: 1,
    frame: 0,
  },
} as const;

export const noisyPreset: SpiralPreset = {
  name: 'Noisy',
  params: {
    color1: 'hsla(87, 77%, 53%, 1)',
    color2: 'hsla(109, 70%, 31%, 1)',
    scale: 1.3,
    offsetX: 0,
    offsetY: 0,
    spiralDensity: 0.5,
    spiralDistortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0.5,
    noiseFreq: 0.1,
    noisePower: 1,
    softness: 0,
    speed: 1,
    frame: 0,
  },
} as const;

export const dropletPreset: SpiralPreset = {
  name: 'Droplet',
  params: {
    color1: 'hsla(320, 50%, 50%, 1)',
    color2: 'hsla(190, 50%, 95%, 1)',
    scale: 0.65,
    offsetX: 0,
    offsetY: 0,
    spiralDensity: 0,
    spiralDistortion: 0,
    strokeWidth: 0.05,
    strokeTaper: 0,
    strokeCap: 1,
    noiseFreq: 0,
    noisePower: 0,
    softness: 0,
    speed: 1,
    frame: 0,
  },
} as const;

export const sandPreset: SpiralPreset = {
  name: 'Sand',
  params: {
    color1: 'hsla(45, 25%, 50%, 1)',
    color2: 'hsla(0, 0%, 87%, 1)',
    scale: 3,
    offsetX: 0,
    offsetY: 0,
    spiralDensity: 0,
    spiralDistortion: 0,
    strokeWidth: 0.15,
    strokeTaper: 0,
    strokeCap: 0,
    noiseFreq: 30,
    noisePower: 1,
    softness: 0.2,
    speed: 0,
    frame: 0,
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
    spiralDensity: 0.8,
    spiralDistortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noiseFreq: 0,
    noisePower: 0,
    softness: 0.5,
    speed: 1,
    frame: 0,
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
    spiralDensity: 0,
    spiralDistortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0.5,
    strokeCap: 0,
    noiseFreq: 0,
    noisePower: 0,
    softness: 0.02,
    speed: 3,
    frame: 0,
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
    spiralDensity: 0,
    spiralDistortion: 0.3,
    strokeWidth: 0.95,
    strokeTaper: 0,
    strokeCap: 1,
    noiseFreq: 0,
    noisePower: 0,
    softness: 0.11,
    speed: 1,
    frame: 0,
  },
} as const;

export const spiralPresets: SpiralPreset[] = [
  defaultPreset,
  noisyPreset,
  dropletPreset,
  swirlPreset,
  sandPreset,
  hookPreset,
  vinylPreset,
];

export const Spiral = (props: SpiralProps): JSX.Element => {
  const uniforms: SpiralUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_offsetX: props.offsetX ?? defaultPreset.params.offsetX,
      u_offsetY: props.offsetY ?? defaultPreset.params.offsetY,
      u_spiralDensity: props.spiralDensity ?? defaultPreset.params.spiralDensity,
      u_spiralDistortion: props.spiralDistortion ?? defaultPreset.params.spiralDistortion,
      u_strokeWidth: props.strokeWidth ?? defaultPreset.params.strokeWidth,
      u_strokeTaper: props.strokeTaper ?? defaultPreset.params.strokeTaper,
      u_strokeCap: props.strokeCap ?? defaultPreset.params.strokeCap,
      u_noiseFreq: props.noiseFreq ?? defaultPreset.params.noiseFreq,
      u_noisePower: props.noisePower ?? defaultPreset.params.noisePower,
      u_softness: props.softness ?? defaultPreset.params.softness,
    };
  }, [
    props.color1,
    props.color2,
    props.scale,
    props.offsetX,
    props.offsetY,
    props.spiralDensity,
    props.spiralDistortion,
    props.strokeWidth,
    props.strokeTaper,
    props.strokeCap,
    props.noiseFreq,
    props.noisePower,
    props.softness,
  ]);

  return <ShaderMount {...props} fragmentShader={spiralFragmentShader} uniforms={uniforms} />;
};
