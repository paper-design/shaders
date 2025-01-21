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

export const defaultPreset: GrainCloudsPreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.3,
    seed: 0,
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(0, 0%, 100%, 1)',
    grainAmount: 0.9,
  },
};

export const skyPreset: GrainCloudsPreset = {
  name: 'Sky',
  params: {
    scale: 1,
    speed: 0.3,
    seed: 0,
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
      u_seed: props.seed ?? defaultPreset.params.seed,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_grainAmount: props.grainAmount ?? defaultPreset.params.grainAmount,
    };
  }, [props.scale, props.seed, props.color1, props.color2, props.grainAmount]);

  return <ShaderMount {...props} fragmentShader={grainCloudsFragmentShader} uniforms={uniforms} />;
};
