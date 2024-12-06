import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { dotsPatternFragmentShader, type DotsPatternUniforms } from '@paper-design/shaders';

export type DotsPatternProps = Omit<ShaderMountProps, 'fragmentShader'> & {
  hue?: number;
  hueRange?: number;
  saturation?: number;
  brightness?: number;
  dotSize?: number;
  dotSizeRange?: number;
  scale?: number;
  speed?: number;
  spreading?: number;
};

/** Some default values for the shader props */
export const dotsPatternDefaults = {
  hue: 0.6,
  hueRange: 0.45,
  saturation: 0.5,
  brightness: 0.5,
  dotSize: 0.15,
  dotSizeRange: 0.05,
  scale: 10,
  speed: 3,
  spreading: 0.25,
} as const;

export const DotsPattern = (props: DotsPatternProps): JSX.Element => {
  const uniforms: DotsPatternUniforms = useMemo(() => {
    return {
      u_hue: props.hue ?? dotsPatternDefaults.hue,
      u_hueRange: props.hueRange ?? dotsPatternDefaults.hueRange,
      u_saturation: props.saturation ?? dotsPatternDefaults.saturation,
      u_brightness: props.brightness ?? dotsPatternDefaults.brightness,
      u_dotSize: props.dotSize ?? dotsPatternDefaults.dotSize,
      u_dotSizeRange: props.dotSizeRange ?? dotsPatternDefaults.dotSizeRange,
      u_scale: props.scale ?? dotsPatternDefaults.scale,
      u_speed: props.speed ?? dotsPatternDefaults.speed,
      u_spreading: props.spreading ?? dotsPatternDefaults.spreading,
    };
  }, [
    props.hue,
    props.hueRange,
    props.saturation,
    props.brightness,
    props.dotSize,
    props.dotSizeRange,
    props.scale,
    props.speed,
    props.spreading,
  ]);

  return <ShaderMount {...props} fragmentShader={dotsPatternFragmentShader} uniforms={uniforms} />;
};
