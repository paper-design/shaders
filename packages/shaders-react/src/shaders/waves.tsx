import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  wavesFragmentShader,
  type WavesUniforms,
  type WavesShape,
  WavesShapes,
} from '@paper-design/shaders';

export type WavesParams = {
  color1?: string;
  color2?: string;
  scale?: number;
  frequency?: number;
  amplitude?: number;
  dutyCycle?: number;
  spacing?: number;
  // shape?: WavesShape;
  shape?: number;
  rotation?: number;
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
    shape: 0,
    // shape: WavesShapes.Zigzag,
    rotation: 0,
  },
} as const;

export const wavesPresets: WavesPreset[] = [defaultPreset];

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
  ]);

  return <ShaderMount {...props} fragmentShader={wavesFragmentShader} uniforms={uniforms} />;
};
