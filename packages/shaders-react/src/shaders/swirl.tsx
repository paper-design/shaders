import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, swirlFragmentShader, type SwirlUniforms } from '@paper-design/shaders';

export type SwirlParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  scale?: number;
  offsetX?: number;
  offsetY?: number;
  frequency?: number;
  twist?: number;
  depth?: number;
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
    color1: 'hsla(0, 0%, 20%, 1)',
    color2: 'hsla(110, 60%, 95%, 1)',
    color3: 'hsla(340, 70%, 80%, 1)',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    frequency: 2.5,
    twist: 0.25,
    depth: 0.4,
    noiseFreq: 30,
    noisePower: 0.2,
    blur: 0,
    speed: 0,
    seed: 0,
  },
} as const;

export const swirlPresets: SwirlPreset[] = [defaultPreset];

export const Swirl = (props: SwirlProps): JSX.Element => {
  const uniforms: SwirlUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_offsetX: props.offsetX ?? defaultPreset.params.offsetX,
      u_offsetY: props.offsetY ?? defaultPreset.params.offsetY,
      u_frequency: props.frequency ?? defaultPreset.params.frequency,
      u_twist: props.twist ?? defaultPreset.params.twist,
      u_depth: props.depth ?? defaultPreset.params.depth,
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
    props.frequency,
    props.twist,
    props.depth,
    props.noiseFreq,
    props.noisePower,
    props.blur,
  ]);

  return <ShaderMount {...props} fragmentShader={swirlFragmentShader} uniforms={uniforms} />;
};
