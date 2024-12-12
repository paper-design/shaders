import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, meshGradientFragmentShader, type MeshGradientUniforms } from '@paper-design/shaders';

export type MeshGradientParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  speed?: number;
};

export type MeshGradientProps = Omit<ShaderMountProps, 'fragmentShader'> & MeshGradientParams;

type MeshGradientPreset = { name: string; params: Required<MeshGradientParams> };

export const defaultPreset: MeshGradientPreset = {
  name: 'Default',
  params: {
    color1: 'hsla(260, 28%, 46%, 1)',
    color2: 'hsla(262, 24%, 63%, 1)',
    color3: 'hsla(48, 90%, 60%, 1)',
    color4: 'hsla(352, 62%, 72%, 1)',
    speed: 0.1,
  },
} as const;

export const beachPreset: MeshGradientPreset = {
  name: 'Beach',
  params: {
    color1: 'hsla(186, 81%, 83%, 1)',
    color2: 'hsla(198, 55%, 68%, 1)',
    color3: 'hsla(53, 67%, 88%, 1)',
    color4: 'hsla(45, 93%, 73%, 1)',
    speed: 0.1,
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset, beachPreset];

export const MeshGradient = (props: MeshGradientProps): JSX.Element => {
  const uniforms: MeshGradientUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
      u_speed: props.speed ?? defaultPreset.params.speed,
    };
  }, [props.color1, props.color2, props.color3, props.color4, props.speed]);

  return <ShaderMount {...props} fragmentShader={meshGradientFragmentShader} uniforms={uniforms} />;
};
