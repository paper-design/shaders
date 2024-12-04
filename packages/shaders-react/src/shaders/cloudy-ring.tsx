import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, cloudyRingFragmentShader, type CloudyRingUniforms } from '@paper-design/shaders';

export type CloudyRingProps = Omit<ShaderMountProps, 'fragmentShader'> & {
  colorBack?: string;
  color1?: string;
  color2?: string;
  speed?: number;
  noiseScale?: number;
  thickness?: number;
};

/** Some default values for the shader props */
export const cloudyRingDefaults = {
  colorBack: '#010101',
  color1: '#ffffff',
  color2: '#47a0ff',
  speed: 1,
  noiseScale: 1.4,
  thickness: 0.33,
} as const;

export const CloudyRing = (props: CloudyRingProps): JSX.Element => {
  const uniforms: CloudyRingUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, cloudyRingDefaults.colorBack),
      u_color1: getShaderColorFromString(props.color1, cloudyRingDefaults.color1),
      u_color2: getShaderColorFromString(props.color2, cloudyRingDefaults.color2),
      u_speed: props.speed ?? cloudyRingDefaults.speed,
      u_scale: props.noiseScale ?? cloudyRingDefaults.noiseScale,
      u_thickness: props.thickness ?? cloudyRingDefaults.thickness,
    };
  }, [props.colorBack, props.color1, props.color2, props.speed, props.noiseScale, props.thickness]);

  return <ShaderMount {...props} fragmentShader={cloudyRingFragmentShader} uniforms={uniforms} />;
};
