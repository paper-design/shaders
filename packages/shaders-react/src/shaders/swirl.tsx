import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, spiralFragmentShader, type SwirlUniforms } from '@paper-design/shaders';

export type SwirlParams = {
  color1?: string;
  color2?: string;
  color3?: string;
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
  blur?: number;
} & GlobalParams;

export type SwirlProps = Omit<ShaderMountProps, 'fragmentShader'> & SwirlParams;

type SwirlPreset = { name: string; params: Required<SwirlParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highmidIntensity bug)

export const defaultPreset: SwirlPreset = {
  name: 'Default',
  params: {
    color1: 'hsla(0, 50%, 50%, 1)',
    color2: 'hsla(100, 50%, 50%, 1)',
    color3: 'hsla(200, 50%, 50%, 1)',
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
    blur: 0.01,
    speed: 1,
    seed: 0,
  },
} as const;


export const swirlPresets: SwirlPreset[] = [
  defaultPreset
];

export const Swirl = (props: SwirlProps): JSX.Element => {
  const uniforms: SwirlUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
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
      u_blur: props.blur ?? defaultPreset.params.blur,
    };
  }, [
    props.color1,
    props.color2,
    props.color3,
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
    props.blur,
  ]);

  return <ShaderMount {...props} fragmentShader={spiralFragmentShader} uniforms={uniforms} />;
};
