import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, dotsOrbitFragmentShader, type DotsOrbitUniforms } from '@paper-design/shaders';

export type DotsOrbitParams = {
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

export type DotsOrbitProps = Omit<ShaderMountProps, 'fragmentShader'> & DotsOrbitParams;

type DotsOrbitPreset = { name: string; params: Required<DotsOrbitParams> };

export const defaultPreset: DotsOrbitPreset = {
  name: 'Default',
  params: {
    color1: '#ce2a2f',
    color2: '#3a6c4f',
    color3: '#f0a71b',
    color4: '#5b3e72',
    dotSize: 0.15,
    dotSizeRange: 0.05,
    scale: 10,
    speed: 3,
    spreading: 0.25,
  },
} as const;

export const dotsOrbitPresets: DotsOrbitPreset[] = [defaultPreset];

export const DotsOrbit = (props: DotsOrbitProps): JSX.Element => {
  const uniforms: DotsOrbitUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
      u_dotSize: props.dotSize ?? defaultPreset.params.dotSize,
      u_dotSizeRange: props.dotSizeRange ?? defaultPreset.params.dotSizeRange,
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_spreading: props.spreading ?? defaultPreset.params.spreading,
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

  return <ShaderMount {...props} fragmentShader={dotsOrbitFragmentShader} uniforms={uniforms} />;
};
