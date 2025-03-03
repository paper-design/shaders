import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  tttttBorderFragmentShader,
  type TttttBorderUniforms,
} from '@paper-design/shaders';

export type TttttBorderParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  blur?: number;
  grainDistortion?: number;
  grainAddon?: number;
  size?: number;
  offsetX?: number;
  offsetY?: number;
  scaleX?: number;
  scaleY?: number;
} & GlobalParams;

export type TttttBorderProps = Omit<ShaderMountProps, 'fragmentShader'> & TttttBorderParams;

type TttttBorderPreset = { name: string; params: Required<TttttBorderParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: TttttBorderPreset = {
  name: 'Default',
  params: {
    speed: 1,
    seed: 0,
    colorBack: 'hsla(358, 94%, 12%, 1)',
    color1: 'hsla(32, 100%, 50%, 1)',
    color2: 'hsla(40, 82%, 67%, 1)',
    // color3: 'hsla(26, 26%, 83%, 1)',
    color3: 'hsla(100, 50%, 20%, 1)',
    offsetX: 0,
    offsetY: 0,
    scaleX: 0,
    scaleY: 0,
    size: 200,
    blur: 0,
    grainDistortion: 0,
    grainAddon: 0,
  },
} as const;



export const tttttBorderPresets: TttttBorderPreset[] = [defaultPreset] as const;

export const TttttBorder = (props: TttttBorderProps): JSX.Element => {
  const uniforms: TttttBorderUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_offsetX: props.offsetX ?? defaultPreset.params.offsetX,
      u_offsetY: props.offsetY ?? defaultPreset.params.offsetY,
      u_scaleX: props.scaleX ?? defaultPreset.params.scaleX,
      u_scaleY: props.scaleY ?? defaultPreset.params.scaleY,
      u_blur: props.blur ?? defaultPreset.params.blur,
      u_grainDistortion: props.grainDistortion ?? defaultPreset.params.grainDistortion,
      u_grainAddon: props.grainAddon ?? defaultPreset.params.grainAddon,
      u_size: props.size ?? defaultPreset.params.size,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.color3,
    props.offsetX,
    props.offsetY,
    props.scaleX,
    props.scaleY,
    props.size,
    props.blur,
    props.grainDistortion,
    props.grainAddon,
  ]);

  return <ShaderMount {...props} fragmentShader={tttttBorderFragmentShader} uniforms={uniforms} />;
};
