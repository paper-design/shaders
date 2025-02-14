import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, wavesFragmentShader } from '@paper-design/shaders';

export type WavesParams = {
  scale?: number;
  rotation?: number;
  color1?: string;
  color2?: string;
  shape?: number;
  frequency?: number;
  amplitude?: number;
  spacing?: number;
  dutyCycle?: number;
  edgeBlur?: number;
};

export type WavesProps = Omit<ShaderMountProps, 'fragmentShader'> & WavesParams;

type WavesPreset = { name: string; params: Required<WavesParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: WavesPreset = {
  name: 'Default',
  params: {
    scale: 1,
    rotation: 0,
    color1: 'hsla(48, 100%, 74%, 1)',
    color2: 'hsla(204, 47%, 45%, 1)',
    shape: 1,
    frequency: 0.5,
    amplitude: 0.5,
    spacing: 0.75,
    dutyCycle: 0.2,
    edgeBlur: 0,
  },
} as const;

export const spikesPreset: WavesPreset = {
  name: 'Spikes',
  params: {
    scale: 2.3,
    rotation: 0,
    color1: 'hsla(65, 100%, 95%, 1)',
    color2: 'hsla(290, 52%, 15%, 1)',
    shape: 0,
    frequency: 0.5,
    amplitude: 0.9,
    spacing: 0.37,
    dutyCycle: 0.93,
    edgeBlur: 0.15,
  },
} as const;

export const groovyPreset: WavesPreset = {
  name: 'Groovy',
  params: {
    scale: 0.5,
    rotation: 1,
    color1: 'hsla(60, 100%, 97%, 1)',
    color2: 'hsla(20, 100%, 71%, 1)',
    shape: 2.37,
    frequency: 0.2,
    amplitude: 0.67,
    spacing: 1.17,
    dutyCycle: 0.57,
    edgeBlur: 0,
  },
} as const;

export const tangledUpPreset: WavesPreset = {
  name: 'Tangled up',
  params: {
    scale: 3.04,
    rotation: 1,
    color1: 'hsla(198.7, 66.7%, 14.1%, 1)',
    color2: 'hsla(85.5, 35.7%, 78%, 1)',
    shape: 3,
    frequency: 0.44,
    amplitude: 0.57,
    spacing: 1.05,
    dutyCycle: 0.97,
    edgeBlur: 0,
  },
} as const;

export const zigZagPreset: WavesPreset = {
  name: 'Zig zag',
  params: {
    scale: 2.7,
    rotation: 1,
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(0, 0%, 90%, 1)',
    shape: 0,
    frequency: 0.6,
    amplitude: 0.8,
    spacing: 0.5,
    dutyCycle: 1,
    edgeBlur: 0.5,
  },
} as const;

export const waveRidePreset: WavesPreset = {
  name: 'Ride the wave',
  params: {
    scale: 0.84,
    rotation: 0,
    color1: 'hsla(65, 100%, 95%, 1)',
    color2: 'hsla(0, 0%, 12%, 1)',
    shape: 2.23,
    frequency: 0.1,
    amplitude: 0.6,
    spacing: 0.41,
    dutyCycle: 0.99,
    edgeBlur: 0,
  },
} as const;

export const wavesPresets: WavesPreset[] = [
  defaultPreset,
  spikesPreset,
  groovyPreset,
  tangledUpPreset,
  zigZagPreset,
  waveRidePreset,
];

export const Waves = (props: WavesProps): JSX.Element => {
  const uniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_rotation: props.rotation ?? defaultPreset.params.rotation,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_shape: props.shape ?? defaultPreset.params.shape,
      u_frequency: props.frequency ?? defaultPreset.params.frequency,
      u_amplitude: props.amplitude ?? defaultPreset.params.amplitude,
      u_spacing: props.spacing ?? defaultPreset.params.spacing,
      u_dutyCycle: props.dutyCycle ?? defaultPreset.params.dutyCycle,
      u_edgeBlur: props.edgeBlur ?? defaultPreset.params.edgeBlur,
    };
  }, [
    props.scale,
    props.rotation,
    props.color1,
    props.color2,
    props.shape,
    props.frequency,
    props.amplitude,
    props.spacing,
    props.dutyCycle,
    props.edgeBlur,
  ]);

  return <ShaderMount {...props} fragmentShader={wavesFragmentShader} uniforms={uniforms} />;
};
