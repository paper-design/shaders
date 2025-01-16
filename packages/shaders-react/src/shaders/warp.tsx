import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, warpFragmentShader, type WarpUniforms } from '@paper-design/shaders';

export type WarpParams = {
  color1?: string;
  color2?: string;
  scale?: number;
  octaveCount?: number;
  persistence?: number;
  lacunarity?: number;
  contour?: number;
  proportion?: number;
} & GlobalParams;

export type WarpProps = Omit<ShaderMountProps, 'fragmentShader'> & WarpParams;

type WarpPreset = { name: string; params: Required<WarpParams> };

export const defaultPreset: WarpPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(203, 100%, 87%, 1)',
    scale: 1,
    speed: 0.5,
    octaveCount: 2,
    persistence: 1,
    lacunarity: 1.5,
    seed: 0,
    contour: 0.9,
    proportion: 0.34,
  },
};

export const warpPresets: WarpPreset[] = [defaultPreset];

export const Warp = (props: WarpProps): JSX.Element => {
  const uniforms: WarpUniforms = useMemo(() => {
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

  return <ShaderMount {...props} fragmentShader={warpFragmentShader} uniforms={uniforms} />;
};
