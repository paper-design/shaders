import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, wavesFragmentShader, type WavesUniforms } from '@paper-design/shaders';

export type WavesParams = {
  color1?: string;
  color2?: string;
  scale?: number;
  frequency?: number;
  amplitude?: number;
  dutyCycle?: number;
  spacing?: number;
  shape?: number;
  rotation?: number;
  edgeBlur?: number;
};

export type WavesProps = Omit<ShaderMountProps, 'fragmentShader'> & WavesParams;

type WavesPreset = { name: string; params: Required<WavesParams> };

export const defaultPreset: WavesPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(48, 100%, 74%, 1)',
    color2: 'hsla(204, 47%, 45%, 1)',
    scale: 1,
    frequency: 0.5,
    amplitude: 0.5,
    dutyCycle: 0.2,
    spacing: 0.75,
    shape: 1,
    rotation: 0,
    edgeBlur: 0,
  },
} as const;

export const preset1: WavesPreset = {
  name: 'Preset #1',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(65, 100%, 95%, 1)',
    color2: 'hsla(290, 52%, 15%, 1)',
    scale: 2.3,
    frequency: 0.5,
    amplitude: 0.57,
    dutyCycle: 0.93,
    spacing: 0.37,
    shape: 0,
    rotation: 0,
    edgeBlur: 0,
  },
} as const;

export const preset2: WavesPreset = {
  name: 'Preset #2',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(60, 100%, 97%, 1)',
    color2: 'hsla(20, 100%, 71%, 1)',
    scale: 0.5,
    frequency: 0.2,
    amplitude: 0.67,
    dutyCycle: 0.57,
    spacing: 1.17,
    shape: 2.37,
    rotation: 1,
    edgeBlur: 0,
  },
} as const;

export const preset3: WavesPreset = {
  name: 'Preset #3',
  params: {
    color1: 'hsla(198, 61%, 43%, 1)',
    color2: 'hsla(0, 0%, 100%, 1)',
    scale: 2.16,
    frequency: 0.48,
    amplitude: 0.57,
    dutyCycle: 0.97,
    spacing: 1.05,
    shape: 3,
    rotation: 0,
    edgeBlur: 0,
  },
} as const;

export const preset4: WavesPreset = {
  name: 'Preset #4',
  params: {
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(0, 0%, 90%, 1)',
    scale: 2.7,
    frequency: 0.6,
    amplitude: 0.8,
    dutyCycle: 1,
    spacing: 0.5,
    shape: 0,
    rotation: 1,
    edgeBlur: .5,
  },
} as const;

export const preset5: WavesPreset = {
  name: 'Preset #5',
  params: {
    color1: 'hsla(65, 100%, 95%, 1)',
    color2: 'hsla(0, 0%, 12%, 1)',
    scale: 1.1,
    frequency: 0.64,
    amplitude: .6,
    dutyCycle: 0.5,
    spacing: 0.3,
    shape: 2.23,
    rotation: 0,
    edgeBlur: 0,
  },
} as const;

export const wavesPresets: WavesPreset[] = [defaultPreset, preset1, preset2, preset3, preset4, preset5];

export const Waves = (props: WavesProps): JSX.Element => {
  const uniforms: WavesUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_frequency: props.frequency ?? defaultPreset.params.frequency,
      u_amplitude: props.amplitude ?? defaultPreset.params.amplitude,
      u_dutyCycle: props.dutyCycle ?? defaultPreset.params.dutyCycle,
      u_spacing: props.spacing ?? defaultPreset.params.spacing,
      u_shape: props.shape ?? defaultPreset.params.shape,
      u_rotation: props.rotation ?? defaultPreset.params.rotation,
      u_edgeBlur: props.edgeBlur ?? defaultPreset.params.edgeBlur,
    };
  }, [
    props.color1,
    props.color2,
    props.scale,
    props.frequency,
    props.amplitude,
    props.dutyCycle,
    props.spacing,
    props.shape,
    props.rotation,
    props.edgeBlur,
  ]);

  return <ShaderMount {...props} fragmentShader={wavesFragmentShader} uniforms={uniforms} />;
};
