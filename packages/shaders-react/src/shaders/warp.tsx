import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, warpFragmentShader, type WarpUniforms } from '@paper-design/shaders';

export type WarpParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  proportion?: number;
  scale?: number;
  distortion?: number;
  swirl?: number;
  swirlIterations?: number;
} & GlobalParams;

export type WarpProps = Omit<ShaderMountProps, 'fragmentShader'> & WarpParams;

type WarpPreset = { name: string; params: Required<WarpParams> };

export const defaultPreset: WarpPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(203, 80%, 70%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    proportion: 0.5,
    scale: 1,
    speed: 1,
    distortion: 1,
    seed: 0,
    swirl: 0.9,
    swirlIterations: 10,
  },
};

export const warpPresets: WarpPreset[] = [defaultPreset];

export const Warp = (props: WarpProps): JSX.Element => {
  const uniforms: WarpUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color2),
      u_proportion: props.proportion ?? defaultPreset.params.proportion,
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_distortion: props.distortion ?? defaultPreset.params.distortion,
      u_swirl: props.swirl ?? defaultPreset.params.swirl,
      u_swirlIterations: props.swirlIterations ?? defaultPreset.params.swirlIterations,
    };
  }, [
    props.color1,
    props.color2,
    props.color3,
    props.proportion,
    props.scale,
    props.distortion,
    props.seed,
    props.swirl,
    props.swirlIterations,
  ]);

  return <ShaderMount {...props} fragmentShader={warpFragmentShader} uniforms={uniforms} />;
};
