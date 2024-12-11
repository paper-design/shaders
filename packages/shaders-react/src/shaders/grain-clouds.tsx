import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, grainCloudsFragmentShader, type GrainCloudsUniforms } from '@paper-design/shaders';

export type GrainCloudsParams = {
  color1?: string;
  color2?: string;
  noiseScale?: number;
  noiseSpeed?: number;
  grainAmount?: number;
};

export type GrainCloudsProps = Omit<ShaderMountProps, 'fragmentShader'> & GrainCloudsParams;

type GrainCloudsPreset = { name: string; params: Required<GrainCloudsParams> };

export const defaultPreset: GrainCloudsPreset = {
  name: 'Default',
  params: {
    color1: 'rgba(0, 0, 0, 1)',
    color2: 'rgba(255, 255, 255, 1)',
    noiseScale: 1,
    noiseSpeed: 0.3,
    grainAmount: 0.05,
  },
} as const;

export const skyPreset: GrainCloudsPreset = {
  name: 'Sky',
  params: {
    color1: '#73a6ff',
    color2: '#ffffff',
    noiseScale: 1,
    noiseSpeed: 0.1,
    grainAmount: 0,
  },
};

export const grainCloudsPresets: GrainCloudsPreset[] = [defaultPreset, skyPreset];

export const GrainClouds = (props: GrainCloudsProps): JSX.Element => {
  const uniforms: GrainCloudsUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_noiseScale: props.noiseScale ?? defaultPreset.params.noiseScale,
      u_noiseSpeed: props.noiseSpeed ?? defaultPreset.params.noiseSpeed,
      u_grainAmount: props.grainAmount ?? defaultPreset.params.grainAmount,
    };
  }, [props.color1, props.color2, props.noiseScale, props.noiseSpeed, props.grainAmount]);

  return <ShaderMount {...props} fragmentShader={grainCloudsFragmentShader} uniforms={uniforms} />;
};
