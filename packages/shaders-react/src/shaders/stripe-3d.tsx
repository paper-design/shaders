import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, stripe3DFragmentShader, type Stripe3DUniforms } from '@paper-design/shaders';

export type Stripe3DParams = {
  scale?: number;
  colorBack?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  amplitude?: number;
  frequency?: number;
} & GlobalParams;

export type Stripe3DProps = Omit<ShaderMountProps, 'fragmentShader'> & Stripe3DParams;

type Stripe3DPreset = { name: string; params: Required<Stripe3DParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: Stripe3DPreset = {
  name: 'Default',
  params: {
    scale: .8,
    speed: 0.15,
    seed: 0,
    colorBack: 'hsla(120, 20%, 90%, 1)',
    color1: 'hsla(94, 38%, 59%, 1)',
    color2: 'hsla(359, 94%, 62%, 1)',
    color3: 'hsla(42, 93%, 64%, 1)',
    amplitude: .3,
    frequency: 4,
  },
} as const;

export const stripe3DPresets: Stripe3DPreset[] = [defaultPreset];

export const Stripe3D = (props: Stripe3DProps): JSX.Element => {
  const uniforms: Stripe3DUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_amplitude: props.amplitude ?? defaultPreset.params.amplitude,
      u_frequency: props.frequency ?? defaultPreset.params.frequency,
    };
  }, [props.scale, props.colorBack, props.color1, props.color2, props.color3, props.amplitude, props.frequency]);

  return <ShaderMount {...props} fragmentShader={stripe3DFragmentShader} uniforms={uniforms} />;
};
