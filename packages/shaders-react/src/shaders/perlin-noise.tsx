import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, perlinNoiseFragmentShader, type PerlinNoiseUniforms } from '@paper-design/shaders';

export type PerlinNoiseParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  proportion?: number;
  contour?: number;
  octaveCount?: number;
  persistence?: number;
  lacunarity?: number;
} & GlobalParams;

export type PerlinNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & PerlinNoiseParams;

type PerlinNoisePreset = { name: string; params: Required<PerlinNoiseParams> };

export const defaultPreset: PerlinNoisePreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    scale: 1,
    speed: 0.5,
    seed: 0,
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(203, 100%, 87%, 1)',
    proportion: 0.34,
    contour: 0.9,
    octaveCount: 2,
    persistence: 1,
    lacunarity: 1.5,
  },
};

export const preset1: PerlinNoisePreset = {
  name: 'Nintendo Water',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    scale: 0.2,
    speed: 0.5,
    seed: 0,
    color1: 'hsla(220, 66%, 50%, 1)',
    color2: 'hsla(155, 66%, 80%, 1)',
    proportion: 0.42,
    contour: 1,
    octaveCount: 2,
    persistence: 0.55,
    lacunarity: 1.8,
  },
};

export const preset2: PerlinNoisePreset = {
  name: 'Colony',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    scale: 0.15,
    speed: 0,
    seed: 0,
    color1: 'hsla(56, 86%, 81%, 1)',
    color2: 'hsla(230, 80%, 20%, 1)',
    octaveCount: 6,
    persistence: 1,
    lacunarity: 2.55,
    proportion: 0.65,
    contour: 0.65,
  },
};

export const preset3: PerlinNoisePreset = {
  name: 'Phosphenes',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    scale: 0.03,
    speed: 0.15,
    seed: 0,
    color1: 'hsla(350, 80%, 70%, 1)',
    color2: 'hsla(150, 50%, 60%, 1)',
    proportion: 0.45,
    contour: 0.55,
    octaveCount: 6,
    persistence: 0.3,
    lacunarity: 3,
  },
} as const;

export const preset4: PerlinNoisePreset = {
  name: 'Moss',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    scale: 0.15,
    speed: 0.02,
    seed: 0,
    color1: 'hsla(137, 100%, 51%, 1)',
    color2: 'hsla(0, 0%, 15%, 1)',
    proportion: 0.65,
    contour: 0.65,
    octaveCount: 6,
    persistence: 1,
    lacunarity: 2.55,
  },
} as const;

export const preset5: PerlinNoisePreset = {
  name: 'Worms',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    scale: 2,
    speed: 0,
    seed: 0,
    color1: 'hsla(0, 100%, 100%, 1)',
    color2: 'hsla(0, 0%, 35%, 1)',
    proportion: 0.5,
    contour: 1,
    octaveCount: 1,
    persistence: 1,
    lacunarity: 1.5,
  },
} as const;

export const perlinNoisePresets: PerlinNoisePreset[] = [defaultPreset, preset1, preset2, preset3, preset4, preset5];

export const PerlinNoise = (props: PerlinNoiseProps): JSX.Element => {
  const uniforms: PerlinNoiseUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_proportion: props.proportion ?? defaultPreset.params.proportion,
      u_contour: props.contour ?? defaultPreset.params.contour,
      u_octaveCount: props.octaveCount ?? defaultPreset.params.octaveCount,
      u_persistence: props.persistence ?? defaultPreset.params.persistence,
      u_lacunarity: props.lacunarity ?? defaultPreset.params.lacunarity,
    };
  }, [
    props.scale,
    props.seed,
    props.color1,
    props.color2,
    props.proportion,
    props.contour,
    props.octaveCount,
    props.persistence,
    props.lacunarity,
  ]);

  return <ShaderMount {...props} fragmentShader={perlinNoiseFragmentShader} uniforms={uniforms} />;
};
