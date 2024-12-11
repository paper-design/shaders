import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, cloudyRingFragmentShader, type CloudyRingUniforms } from '@paper-design/shaders';

export type CloudyRingParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  speed?: number;
  noiseScale?: number;
  thickness?: number;
};

export type CloudyRingProps = Omit<ShaderMountProps, 'fragmentShader'> & CloudyRingParams;

type CloudyRingPreset = { name: string; params: Required<CloudyRingParams> };

export const defaultPreset: CloudyRingPreset = {
  name: 'Default',
  params: {
    colorBack: '#010101',
    color1: '#ffffff',
    color2: '#47a0ff',
    speed: 1,
    noiseScale: 1.4,
    thickness: 0.33,
  },
} as const;

export const cloudyRingPresets: CloudyRingPreset[] = [defaultPreset];

export const CloudyRing = (props: CloudyRingProps): JSX.Element => {
  const uniforms: CloudyRingUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_scale: props.noiseScale ?? defaultPreset.params.noiseScale,
      u_thickness: props.thickness ?? defaultPreset.params.thickness,
    };
  }, [props.colorBack, props.color1, props.color2, props.speed, props.noiseScale, props.thickness]);

  return <ShaderMount {...props} fragmentShader={cloudyRingFragmentShader} uniforms={uniforms} />;
};
