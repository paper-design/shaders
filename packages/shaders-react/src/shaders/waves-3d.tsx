import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, waves3DFragmentShader, type Waves3DUniforms } from '@paper-design/shaders';

export type Waves3DParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  amplitude1?: number;
  amplitude2?: number;
  frequency1?: number;
  frequency2?: number;
  grain?: number;
} & GlobalParams;

export type Waves3DProps = Omit<ShaderMountProps, 'fragmentShader'> & Waves3DParams;

type Waves3DPreset = { name: string; params: Required<Waves3DParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: Waves3DPreset = {
  name: 'Default',
  params: {
    speed: 1,
    seed: 0,
    colorBack: 'hsla(196, 100%, 52%, 1)',
    color1: 'hsla(230, 100%, 53%, 1)',
    color2: 'hsla(0, 100%, 75%, 1)',
    amplitude1: 0.15,
    frequency1: 6,
    amplitude2: 0.1,
    frequency2: 6,
    grain: .0,
  },
} as const;

export const waves3DPresets: Waves3DPreset[] = [defaultPreset];

export const Waves3D = (props: Waves3DProps): JSX.Element => {
  const uniforms: Waves3DUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_amplitude1: props.amplitude1 ?? defaultPreset.params.amplitude1,
      u_amplitude2: props.amplitude2 ?? defaultPreset.params.amplitude2,
      u_frequency1: props.frequency1 ?? defaultPreset.params.frequency1,
      u_frequency2: props.frequency2 ?? defaultPreset.params.frequency2,
      u_grain: props.grain ?? defaultPreset.params.grain,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.amplitude1,
    props.amplitude2,
    props.frequency1,
    props.frequency2,
    props.grain,
  ]);

  return <ShaderMount {...props} fragmentShader={waves3DFragmentShader} uniforms={uniforms} />;
};
