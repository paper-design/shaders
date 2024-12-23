import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, perlinNoiseFragmentShader, type PerlinNoiseUniforms } from '@paper-design/shaders';

export type PerlinNoiseParams = {
  color1?: string;
  color2?: string;
  scale?: number;
  frequency?: number;
  octaveCount?: number;
  persistence?: number;
  lacunarity?: number;
  perlinSeed?: number;
} & GlobalParams;

export type PerlinNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & PerlinNoiseParams;

type PerlinNoisePreset = { name: string; params: Required<PerlinNoiseParams> };

export const defaultPreset: PerlinNoisePreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(208.42, 24.68%, 45.29%, 1)',
    color2: 'hsla(94.07, 38.39%, 58.63%, 1)',
    scale: 0.1,
    speed: 0.,
    frequency: 12,
    octaveCount: 10,
    persistence: 0.5,
    lacunarity: 2,
    perlinSeed: 0,
  },
} as const;

export const perlinNoisePresets: PerlinNoisePreset[] = [defaultPreset];

export const PerlinNoise = (props: PerlinNoiseProps): JSX.Element => {
  const uniforms: PerlinNoiseUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_frequency: props.frequency ?? defaultPreset.params.frequency,
      u_octaveCount: props.octaveCount ?? defaultPreset.params.octaveCount,
      u_persistence: props.persistence ?? defaultPreset.params.persistence,
      u_lacunarity: props.lacunarity ?? defaultPreset.params.lacunarity,
      u_perlinSeed: props.perlinSeed ?? defaultPreset.params.perlinSeed,
    };
  }, [
    props.color1,
    props.color2,
    props.scale,
    props.frequency,
    props.octaveCount,
    props.persistence,
    props.lacunarity,
    props.perlinSeed,
  ]);

  return <ShaderMount {...props} fragmentShader={perlinNoiseFragmentShader} uniforms={uniforms} />;
};
