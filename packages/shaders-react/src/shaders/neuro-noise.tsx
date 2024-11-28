import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import {getShaderColorFromString, neuroNoiseFragmentShader, type NeuroNoiseUniforms } from '@paper-design/shaders';
import {meshGradientDefaults} from "./mesh-gradient";

export type NeuroNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & {
  color1?: string;
};

/** Some default values for the shader props */
export const neuroNoiseDefaults = {
  color1: '#c3a3ff',
} as const;

export const NeuroNoise = (props: NeuroNoiseProps): JSX.Element => {
  const uniforms: NeuroNoiseUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, neuroNoiseDefaults.color1),
    };
  }, [props.color1]);

  return <ShaderMount {...props} fragmentShader={neuroNoiseFragmentShader} uniforms={uniforms} />;
};
