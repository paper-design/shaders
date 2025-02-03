import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, stripe3DFragmentShader, type Stripe3DUniforms } from '@paper-design/shaders';

export type Stripe3DParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  width?: number;
  length?: number;
  amplitude1?: number;
  amplitude2?: number;
  frequency1?: number;
  frequency2?: number;
  rotation?: number;
} & GlobalParams;

export type Stripe3DProps = Omit<ShaderMountProps, 'fragmentShader'> & Stripe3DParams;

type Stripe3DPreset = { name: string; params: Required<Stripe3DParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: Stripe3DPreset = {
  name: 'Default',
  params: {
    speed: 0,
    seed: 0,
    colorBack: 'hsla(0, 0%, 100%, 1)',
    color1: 'hsla(200, 80%, 80%, 1)',
    color2: 'hsla(350, 80%, 80%, 1)',
    width: 1,
    length: 4,
    amplitude1: 0.15,
    frequency1: 12,
    amplitude2: 0.04,
    frequency2: 2,
  },
} as const;

export const stripe3DPresets: Stripe3DPreset[] = [defaultPreset];

export const Stripe3D = (props: Stripe3DProps): JSX.Element => {
  const uniforms: Stripe3DUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_width: props.width ?? defaultPreset.params.width,
      u_length: props.length ?? defaultPreset.params.length,
      u_amplitude1: props.amplitude1 ?? defaultPreset.params.amplitude1,
      u_amplitude2: props.amplitude2 ?? defaultPreset.params.amplitude2,
      u_frequency1: props.frequency1 ?? defaultPreset.params.frequency1,
      u_frequency2: props.frequency2 ?? defaultPreset.params.frequency2,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.width,
    props.length,
    props.amplitude1,
    props.amplitude2,
    props.frequency1,
    props.frequency2,
  ]);

  return <ShaderMount {...props} fragmentShader={stripe3DFragmentShader} uniforms={uniforms} />;
};
