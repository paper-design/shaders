import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, meshGradientFragmentShader, type MeshGradientUniforms } from '@paper-design/shaders';

export type MeshGradientParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
} & GlobalParams;

export type MeshGradientProps = Omit<ShaderMountProps, 'fragmentShader'> & MeshGradientParams;

type MeshGradientPreset = { name: string; params: Required<MeshGradientParams> };

export const defaultPreset: MeshGradientPreset = {
  name: 'Default',
  params: {
    speed: 0.15,
    seed: 0,
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(259, 29%, 73%, 1)',
    color2: 'hsla(263, 57%, 39%, 1)',
    color3: 'hsla(48, 73%, 84%, 1)',
    color4: 'hsla(295, 32%, 70%, 1)',
  },
} as const;

export const beachPreset: MeshGradientPreset = {
  name: 'Beach',
  params: {
    speed: 0.1,
    seed: 0,
    color1: 'hsla(186, 81%, 83%, 1)',
    color2: 'hsla(198, 55%, 68%, 1)',
    color3: 'hsla(53, 67%, 88%, 1)',
    color4: 'hsla(45, 93%, 73%, 1)',
  },
};

export const fadedPreset: MeshGradientPreset = {
  name: 'Faded',
  params: {
    speed: -0.3,
    seed: 0,
    color1: 'hsla(185.7, 41.2%, 90%, 1)',
    color2: 'hsla(207.8, 71.1%, 85.1%, 1)',
    color3: 'hsla(182.9, 51.2%, 92%, 1)',
    color4: 'hsla(201.1, 72.5%, 90.0%, 1)',
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset, beachPreset, fadedPreset];

export const MeshGradient = (props: MeshGradientProps): JSX.Element => {
  const uniforms: MeshGradientUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_seed: props.seed ?? defaultPreset.params.seed,
    };
  }, [props.color1, props.color2, props.color3, props.color4, props.speed, props.seed]);

  return <ShaderMount {...props} fragmentShader={meshGradientFragmentShader} uniforms={uniforms} />;
};
