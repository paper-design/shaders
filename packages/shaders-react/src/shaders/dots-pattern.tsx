import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, dotsPatternFragmentShader, type DotsPatternUniforms } from '@paper-design/shaders';
import { meshGradientDefaults } from './mesh-gradient';

export type DotsPatternProps = Omit<ShaderMountProps, 'fragmentShader'> & {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  dotSize?: number;
  dotSizeRange?: number;
  scale?: number;
  speed?: number;
  spreading?: number;
};

/** Some default values for the shader props */
export const dotsPatternDefaults = {
  color1: '#ce2a2f',
  color2: '#3a6c4f',
  color3: '#f0a71b',
  color4: '#5b3e72',
  dotSize: 0.15,
  dotSizeRange: 0.05,
  scale: 10,
  speed: 3,
  spreading: 0.25,
} as const;

export const DotsPattern = (props: DotsPatternProps): JSX.Element => {
  const uniforms: DotsPatternUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, dotsPatternDefaults.color1),
      u_color2: getShaderColorFromString(props.color2, dotsPatternDefaults.color2),
      u_color3: getShaderColorFromString(props.color3, dotsPatternDefaults.color3),
      u_color4: getShaderColorFromString(props.color4, dotsPatternDefaults.color4),
      u_dotSize: props.dotSize ?? dotsPatternDefaults.dotSize,
      u_dotSizeRange: props.dotSizeRange ?? dotsPatternDefaults.dotSizeRange,
      u_scale: props.scale ?? dotsPatternDefaults.scale,
      u_speed: props.speed ?? dotsPatternDefaults.speed,
      u_spreading: props.spreading ?? dotsPatternDefaults.spreading,
    };
  }, [
    props.color1,
    props.color2,
    props.color3,
    props.color4,
    props.dotSize,
    props.dotSizeRange,
    props.scale,
    props.speed,
    props.spreading,
  ]);

  return <ShaderMount {...props} fragmentShader={dotsPatternFragmentShader} uniforms={uniforms} />;
};
