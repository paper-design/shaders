import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, grainCloudsFragmentShader, type GrainCloudsUniforms } from '@paper-design/shaders';

export type GrainCloudsProps = Omit<ShaderMountProps, 'fragmentShader'> & {
  color1?: string;
  color2?: string;
  noiseScale?: number;
  noiseSpeed?: number;
  grainAmount?: number;
};

/** Some default values for the shader props */
export const grainCloudsDefaults = {
  color1: '#000000',
  color2: '#ffffff',
  noiseScale: 1,
  noiseSpeed: 0.3,
  grainAmount: 0.05,
} as const;

export const GrainClouds = (props: GrainCloudsProps): JSX.Element => {
  const uniforms: GrainCloudsUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, grainCloudsDefaults.color1),
      u_color2: getShaderColorFromString(props.color2, grainCloudsDefaults.color2),
      u_noiseScale: props.noiseScale ?? grainCloudsDefaults.noiseScale,
      u_noiseSpeed: props.noiseSpeed ?? grainCloudsDefaults.noiseSpeed,
      u_grainAmount: props.grainAmount ?? grainCloudsDefaults.grainAmount,
    };
  }, [props.color1, props.color2, props.noiseScale, props.noiseSpeed, props.grainAmount]);

  return <ShaderMount {...props} fragmentShader={grainCloudsFragmentShader} uniforms={uniforms} />;
};
