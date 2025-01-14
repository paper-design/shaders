import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  wavesFragmentShader,
  type WavesUniforms,
} from '@paper-design/shaders';

export type WavesParams = {
  color1?: string;
  color2?: string;
  scale?: number;
  frequency?: number;
  amplitude?: number;
  dutyCycle?: number;
  spacing?: number;
} & GlobalParams;

export type WavesProps = Omit<ShaderMountProps, 'fragmentShader'> & WavesParams;

type WavesPreset = { name: string; params: Required<WavesParams> };

export const defaultPreset: WavesPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(208, 25%, 45%, 1)',
    color2: 'hsla(94, 38%, 59%, 1)',
    scale: 1,
    speed: 0.15,
    frequency: .5,
    amplitude: .5,
    dutyCycle: .2,
    spacing: 3,
    seed: 0,
  },
} as const;

export const wavesPresets: WavesPreset[] = [
  defaultPreset
];

export const Waves = (props: WavesProps): JSX.Element => {
  const uniforms: WavesUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_frequency: props.frequency ?? defaultPreset.params.frequency,
      u_amplitude: props.amplitude ?? defaultPreset.params.amplitude,
      u_dutyCycle: props.dutyCycle ?? defaultPreset.params.dutyCycle,
      u_spacing: props.spacing ?? defaultPreset.params.spacing,
      u_seed: props.seed ?? defaultPreset.params.seed,
    };
  }, [
    props.color1,
    props.color2,
    props.scale,
    props.speed,
    props.frequency,
    props.amplitude,
    props.dutyCycle,
    props.spacing,
    props.seed,
  ]);

  return <ShaderMount {...props} fragmentShader={wavesFragmentShader} uniforms={uniforms} />;
};
