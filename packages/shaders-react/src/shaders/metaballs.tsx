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

type MetaballsPreset = { name: string; params: Required<MetaballsParams>; style?: React.CSSProperties };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: MetaballsPreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.6,
    frame: 0,
    color1: 'hsla(350, 90%, 55%, 1)',
    color2: 'hsla(350, 80%, 60%, 1)',
    color3: 'hsla(20, 85%, 70%, 1)',
    ballSize: 1,
    visibilityRange: 0.4,
  },
};

export const metaballsPresets: MetaballsPreset[] = [defaultPreset];

export const Metaballs = (props: MetaballsProps): React.ReactElement => {
  const uniforms: MetaballsUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_ballSize: props.ballSize ?? defaultPreset.params.ballSize,
      u_visibilityRange: props.visibilityRange ?? defaultPreset.params.visibilityRange,
    };
  }, [props.scale, props.color1, props.color2, props.color3, props.ballSize, props.visibilityRange]);

  return <ShaderMount {...props} fragmentShader={metaballsFragmentShader} uniforms={uniforms} />;
};
