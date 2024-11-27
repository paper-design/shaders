import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, meshGradientFragmentShader, type MeshGradientUniforms } from '@paper-design/shaders';

export type MeshGradientProps = Omit<ShaderMountProps, 'fragmentShader'> & {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  speed?: number;
};

/** Some default values for the shader props */
export const meshGradientDefaults = {
  color1: '#6a5496',
  color2: '#9b8ab8',
  color3: '#f5d03b',
  color4: '#e48b97',
  speed: 0.1,
} as const;

export const MeshGradient = (props: MeshGradientProps): JSX.Element => {
  const uniforms: MeshGradientUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, meshGradientDefaults.color1),
      u_color2: getShaderColorFromString(props.color2, meshGradientDefaults.color2),
      u_color3: getShaderColorFromString(props.color3, meshGradientDefaults.color3),
      u_color4: getShaderColorFromString(props.color4, meshGradientDefaults.color4),
      u_speed: props.speed ?? meshGradientDefaults.speed,
    };
  }, [props.color1, props.color2, props.color3, props.color4, props.speed]);

  return <ShaderMount {...props} fragmentShader={meshGradientFragmentShader} uniforms={uniforms} />;
};
