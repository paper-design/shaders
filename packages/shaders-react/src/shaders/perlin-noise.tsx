import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, perlinNoiseFragmentShader, type PerlinNoiseUniforms } from '@paper-design/shaders';

export type PerlinNoiseParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  proportion?: number;
  softness?: number;
  octaveCount?: number;
  persistence?: number;
  lacunarity?: number;
} & GlobalParams;

export type PerlinNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & PerlinNoiseParams;

type PerlinNoisePreset = { name: string; params: Required<PerlinNoiseParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: PerlinNoisePreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.5,
    frame: 0,
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(0, 0%, 85%, 1)',
    proportion: 0.35,
    softness: 0.1,
    octaveCount: 2,
    persistence: 1,
    lacunarity: 1.5,
  },
};

export const nintendoWaterPreset: PerlinNoisePreset = {
  name: 'Nintendo Water',
  params: {
    scale: 0.2,
    speed: 0.4,
    frame: 0,
    color1: 'hsla(220, 66%, 50%, 1)',
    color2: 'hsla(200, 66%, 90%, 1)',
    proportion: 0.42,
    softness: 0,
    octaveCount: 2,
    persistence: 0.55,
    lacunarity: 1.8,
  },
};

export const colonyPreset: PerlinNoisePreset = {
  name: 'Colony',
  params: {
    scale: 0.15,
    speed: 0,
    frame: 0,
    color1: 'hsla(56, 86%, 81%, 1)',
    color2: 'hsla(230, 80%, 20%, 1)',
    octaveCount: 6,
    persistence: 1,
    lacunarity: 2.55,
    proportion: 0.65,
    softness: 0.35,
  },
};

export const phosphenesPreset: PerlinNoisePreset = {
  name: 'Phosphenes',
  params: {
    scale: 0.03,
    speed: 0.15,
    frame: 0,
    color1: 'hsla(350, 80%, 70%, 1)',
    color2: 'hsla(150, 50%, 60%, 1)',
    proportion: 0.45,
    softness: 0.45,
    octaveCount: 6,
    persistence: 0.3,
    lacunarity: 3,
  },
};

export const mossPreset: PerlinNoisePreset = {
  name: 'Moss',
  params: {
    scale: 0.15,
    speed: 0.02,
    frame: 0,
    color1: 'hsla(137, 100%, 51%, 1)',
    color2: 'hsla(0, 0%, 15%, 1)',
    proportion: 0.65,
    softness: 0.35,
    octaveCount: 6,
    persistence: 1,
    lacunarity: 2.55,
  },
};

export const wormsPreset: PerlinNoisePreset = {
  name: 'Worms',
  params: {
    scale: 2,
    speed: 0,
    frame: 0,
    color1: 'hsla(0, 100%, 100%, 1)',
    color2: 'hsla(0, 0%, 35%, 1)',
    proportion: 0.5,
    softness: 0,
    octaveCount: 1,
    persistence: 1,
    lacunarity: 1.5,
  },
};

export const perlinNoisePresets: PerlinNoisePreset[] = [
  defaultPreset,
  nintendoWaterPreset,
  colonyPreset,
  phosphenesPreset,
  mossPreset,
  wormsPreset,
];

export const PerlinNoise = ({
  scale,
  color1,
  color2,
  proportion,
  softness,
  octaveCount,
  persistence,
  lacunarity,
  ...props
}: PerlinNoiseProps): React.ReactElement => {
  const uniforms: PerlinNoiseUniforms = useMemo(() => {
    return {
      u_scale: scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(color2, defaultPreset.params.color2),
      u_proportion: proportion ?? defaultPreset.params.proportion,
      u_softness: softness ?? defaultPreset.params.softness,
      u_octaveCount: octaveCount ?? defaultPreset.params.octaveCount,
      u_persistence: persistence ?? defaultPreset.params.persistence,
      u_lacunarity: lacunarity ?? defaultPreset.params.lacunarity,
    };
  }, [scale, color1, color2, proportion, softness, octaveCount, persistence, lacunarity]);

  return <ShaderMount {...props} fragmentShader={perlinNoiseFragmentShader} uniforms={uniforms} />;
};
