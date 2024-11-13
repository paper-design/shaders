import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, grainCloudsFragmentShader, type GrainCloudsUniforms } from '@paper-design/shaders';

type GrainCloudsProps = Omit<ShaderMountProps, 'fragmentShader'> & {
  color1?: string;
  color2?: string;
  noiseScale?: number;
  noiseSpeed?: number;
  grainAmount?: number;
};

export const GrainClouds = (props: GrainCloudsProps): JSX.Element => {
  const uniforms: GrainCloudsUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, [0, 0, 0]),
      u_color2: getShaderColorFromString(props.color2, [255, 255, 255]),
      u_noiseScale: props.noiseScale ?? 1,
      u_noiseSpeed: props.noiseSpeed ?? 0.3,
      u_grainAmount: props.grainAmount ?? 0.05,
    };
  }, [props.color1, props.color2, props.noiseScale, props.noiseSpeed, props.grainAmount]);

  return <ShaderMount {...props} fragmentShader={grainCloudsFragmentShader} uniforms={uniforms} />;
};
