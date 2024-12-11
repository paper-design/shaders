import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, smokeRingFragmentShader, type SmokeRingUniforms } from '@paper-design/shaders';

export type SmokeRingParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  speed?: number;
  noiseScale?: number;
  thickness?: number;
};

export type SmokeRingProps = Omit<ShaderMountProps, 'fragmentShader'> & SmokeRingParams;

type SmokeRingPreset = { name: string; params: Required<SmokeRingParams> };

export const defaultPreset: SmokeRingPreset = {
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

export const smokeRingPresets: SmokeRingPreset[] = [defaultPreset];

export const SmokeRing = (props: SmokeRingProps): JSX.Element => {
  const uniforms: SmokeRingUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_scale: props.noiseScale ?? defaultPreset.params.noiseScale,
      u_thickness: props.thickness ?? defaultPreset.params.thickness,
    };
  }, [props.colorBack, props.color1, props.color2, props.speed, props.noiseScale, props.thickness]);

  return <ShaderMount {...props} fragmentShader={smokeRingFragmentShader} uniforms={uniforms} />;
};
