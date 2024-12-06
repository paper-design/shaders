import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  steppedSimplexNoiseFragmentShader,
  type SteppedSimplexNoiseUniforms,
} from '@paper-design/shaders';

export type SteppedSimplexNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
  scale?: number;
  speed?: number;
  stepsNumber?: number;
};

/** Some default values for the shader props */
export const steppedSimplexNoiseDefaults = {
  color1: '#577590',
  color2: '#90BE6D',
  color3: '#F94144',
  color4: '#F9C74F',
  color5: '#ffffff',
  scale: 0.5,
  speed: 0.6,
  stepsNumber: 13,
} as const;

export const SteppedSimplexNoise = (props: SteppedSimplexNoiseProps): JSX.Element => {
  const uniforms: SteppedSimplexNoiseUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, steppedSimplexNoiseDefaults.color1),
      u_color2: getShaderColorFromString(props.color2, steppedSimplexNoiseDefaults.color2),
      u_color3: getShaderColorFromString(props.color3, steppedSimplexNoiseDefaults.color3),
      u_color4: getShaderColorFromString(props.color4, steppedSimplexNoiseDefaults.color4),
      u_color5: getShaderColorFromString(props.color5, steppedSimplexNoiseDefaults.color5),
      u_scale: props.scale ?? steppedSimplexNoiseDefaults.scale,
      u_speed: props.speed ?? steppedSimplexNoiseDefaults.speed,
      u_steps_number: props.stepsNumber ?? steppedSimplexNoiseDefaults.stepsNumber,
    };
  }, [
    props.color1,
    props.color2,
    props.color3,
    props.color4,
    props.color5,
    props.scale,
    props.speed,
    props.stepsNumber,
  ]);

  return <ShaderMount {...props} fragmentShader={steppedSimplexNoiseFragmentShader} uniforms={uniforms} />;
};
