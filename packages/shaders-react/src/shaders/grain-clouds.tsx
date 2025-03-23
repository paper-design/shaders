import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, grainCloudsFragmentShader, type GrainCloudsUniforms } from '@paper-design/shaders';

export type GrainCloudsParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  grainAmount?: number;
} & GlobalParams;

export type GrainCloudsProps = Omit<ShaderMountProps, 'fragmentShader'> & GrainCloudsParams;

type GrainCloudsPreset = { name: string; params: Required<GrainCloudsParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: GrainCloudsPreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.3,
    frame: 0,
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(0, 0%, 100%, 1)',
    grainAmount: 1,
  },
};

export const skyPreset: GrainCloudsPreset = {
  name: 'Sky',
  params: {
    scale: 1,
    speed: 0.3,
    frame: 0,
    color1: 'hsla(218, 100%, 73%, 1)',
    color2: 'hsla(0, 0%, 100%, 1)',
    grainAmount: 0,
  },
};

export const grainCloudsPresets: GrainCloudsPreset[] = [defaultPreset, skyPreset];

export const GrainClouds = (props: GrainCloudsProps): JSX.Element => {
  const uniforms: GrainCloudsUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_grainAmount: props.grainAmount ?? defaultPreset.params.grainAmount,
    };
  }, [props.scale, props.color1, props.color2, props.grainAmount]);

  return <ShaderMount {...props} fragmentShader={grainCloudsFragmentShader} uniforms={uniforms} />;
};
