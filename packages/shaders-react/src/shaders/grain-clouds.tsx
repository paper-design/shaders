import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, grainCloudsFragmentShader, type GrainCloudsUniforms } from '@paper-design/shaders';

export type GrainCloudsParams = {
  color1?: string;
  color2?: string;
  scale?: number;
  grainAmount?: number;
} & GlobalParams;

export type GrainCloudsProps = Omit<ShaderMountProps, 'fragmentShader'> & GrainCloudsParams;

type GrainCloudsPreset = { name: string; params: Required<GrainCloudsParams> };

export const defaultPreset: GrainCloudsPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(0, 0%, 100%, 1)',
    scale: 1,
    grainAmount: 0.05,
    speed: 0.3,
    seed: 0,
  },
};

export const skyPreset: GrainCloudsPreset = {
  name: 'Sky',
  params: {
    color1: '#73a6ff',
    color2: '#ffffff',
    scale: 1,
    grainAmount: 0,
    speed: 0.3,
    seed: 0,
  },
};

export const grainCloudsPresets: GrainCloudsPreset[] = [defaultPreset, skyPreset];

export const GrainClouds = (props: GrainCloudsProps): JSX.Element => {
  const uniforms: GrainCloudsUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_grainAmount: props.grainAmount ?? defaultPreset.params.grainAmount,
      u_seed: props.seed ?? defaultPreset.params.seed,
    };
  }, [props.color1, props.color2, props.scale, props.grainAmount, props.seed]);

  return <ShaderMount {...props} fragmentShader={grainCloudsFragmentShader} uniforms={uniforms} />;
};
