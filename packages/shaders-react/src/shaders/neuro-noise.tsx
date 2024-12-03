import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, neuroNoiseFragmentShader, type NeuroNoiseUniforms } from '@paper-design/shaders';

export type NeuroNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & {
  colorFront?: string;
  colorBack?: string;
  scale?: number;
  speed?: number;
  brightness?: number;
};

/** Some default values for the shader props */
export const neuroNoiseDefaults = {
  colorFront: '#c3a3ff',
  colorBack: '#000000',
  scale: 1,
  speed: 1,
  brightness: 1.3,
} as const;

export const NeuroNoise = (props: NeuroNoiseProps): JSX.Element => {
  const uniforms: NeuroNoiseUniforms = useMemo(() => {
    return {
      u_colorFront: getShaderColorFromString(props.colorFront, neuroNoiseDefaults.colorFront),
      u_colorBack: getShaderColorFromString(props.colorBack, neuroNoiseDefaults.colorBack),
      u_scale: props.scale ?? neuroNoiseDefaults.scale,
      u_speed: props.speed ?? neuroNoiseDefaults.speed,
      u_brightness: props.brightness ?? neuroNoiseDefaults.brightness,
    };
  }, [props.colorFront, props.colorBack, props.scale, props.speed, props.brightness]);

  return <ShaderMount {...props} fragmentShader={neuroNoiseFragmentShader} uniforms={uniforms} />;
};
