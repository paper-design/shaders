import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, metaballsFragmentShader, type MetaballsUniforms } from '@paper-design/shaders';

export type MetaballsParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  ballSize?: number;
  visibilityRange?: number;
} & GlobalParams;

export type MetaballsProps = Omit<ShaderMountProps, 'fragmentShader'> & MetaballsParams;

type MetaballsPreset = { name: string; params: Required<MetaballsParams> };

export const defaultPreset: MetaballsPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    scale: 1,
    speed: 0.6,
    seed: 0,
    color1: 'hsla(350, 90%, 55%, 1)',
    color2: 'hsla(350, 80%, 60%, 1)',
    color3: 'hsla(20, 85%, 70%, 1)',
    ballSize: 1,
    visibilityRange: 0.4,
  },
} as const;

export const metaballsPresets: MetaballsPreset[] = [defaultPreset];

export const Metaballs = (props: MetaballsProps): JSX.Element => {
  const uniforms: MetaballsUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_seed: props.seed ?? defaultPreset.params.seed,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_ballSize: props.ballSize ?? defaultPreset.params.ballSize,
      u_visibilityRange: props.visibilityRange ?? defaultPreset.params.visibilityRange,
    };
  }, [props.scale, props.seed, props.color1, props.color2, props.color3, props.ballSize, props.visibilityRange]);

  return <ShaderMount {...props} fragmentShader={metaballsFragmentShader} uniforms={uniforms} />;
};
