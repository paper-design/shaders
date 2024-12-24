import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, perlinNoiseFragmentShader, type PerlinNoiseUniforms } from '@paper-design/shaders';

export type PerlinNoiseParams = {
  color1?: string;
  color2?: string;
  scale?: number;
  octaveCount?: number;
  persistence?: number;
  lacunarity?: number;
  contour?: number;
  proportion?: number;
} & GlobalParams;

export type PerlinNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & PerlinNoiseParams;

type PerlinNoisePreset = { name: string; params: Required<PerlinNoiseParams> };

export const defaultPreset: PerlinNoisePreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(250, 70%, 80%, 1)',
    color2: 'hsla(10, 70%, 90%, 1)',
    scale: 0.1,
    speed: .1,
    octaveCount: 6,
    persistence: 0.5,
    lacunarity: 2.5,
    seed: 1,
    contour: .55,
    proportion: .45,
  },
} as const;

export const preset1: PerlinNoisePreset = {
  name: '1',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(220, 66%, 50%, 1)',
    color2: 'hsla(155, 66%, 80%, 1)',
    scale: 0.4,
    speed: .5,
    octaveCount: 2,
    persistence: 0.55,
    lacunarity: 1.8,
    seed: 0,
    contour: 1,
    proportion: .42,
  },
};

export const preset2: PerlinNoisePreset = {
  name: '2',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(56, 86%, 81%, 1)',
    color2: 'hsla(230, 80%, 20%, 1)',
    scale: 0.3,
    speed: 0,
    octaveCount: 6,
    persistence: 1,
    lacunarity: 2.55,
    seed: 0,
    contour: .65,
    proportion: .65,
  },
};

export const perlinNoisePresets: PerlinNoisePreset[] = [defaultPreset, preset1, preset2];

export const PerlinNoise = (props: PerlinNoiseProps): JSX.Element => {
  const uniforms: PerlinNoiseUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_octaveCount: props.octaveCount ?? defaultPreset.params.octaveCount,
      u_persistence: props.persistence ?? defaultPreset.params.persistence,
      u_lacunarity: props.lacunarity ?? defaultPreset.params.lacunarity,
      u_contour: props.contour ?? defaultPreset.params.contour,
      u_proportion: props.proportion ?? defaultPreset.params.proportion,
    };
  }, [
    props.color1,
    props.color2,
    props.scale,
    props.octaveCount,
    props.persistence,
    props.lacunarity,
    props.seed,
    props.contour,
    props.proportion,
  ]);

  return <ShaderMount {...props} fragmentShader={perlinNoiseFragmentShader} uniforms={uniforms} />;
};
