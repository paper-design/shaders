import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, godRaysFragmentShader, type GodRaysUniforms } from '@paper-design/shaders';

export type GodRaysParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  offsetX?: number;
  offsetY?: number;
  spotty?: number;
  light?: number;
  midShape?: number;
  density?: number;
  frequency?: number;
} & GlobalParams;

export type GodRaysProps = Omit<ShaderMountProps, 'fragmentShader'> & GodRaysParams;

type GodRaysPreset = { name: string; params: Required<GodRaysParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: GodRaysPreset = {
  name: 'Default',
  params: {
    speed: 1,
    seed: 0,
    colorBack: 'hsla(200, 50%, 30%, 1)',
    color1: 'hsla(20, 80%, 80%, 1)',
    color2: 'hsla(120, 80%, 80%, 1)',
    offsetX: -0.4,
    offsetY: -0.65,
    spotty: 0.25,
    light: 0.35,
    midShape: 1.5,
    density: 0.4,
    frequency: 3,
  },
} as const;

export const godRaysPresets: GodRaysPreset[] = [defaultPreset];

export const GodRays = (props: GodRaysProps): JSX.Element => {
  const uniforms: GodRaysUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_offsetX: props.offsetX ?? defaultPreset.params.offsetX,
      u_offsetY: props.offsetY ?? defaultPreset.params.offsetY,
      u_spotty: props.spotty ?? defaultPreset.params.spotty,
      u_light: props.light ?? defaultPreset.params.light,
      u_midShape: props.midShape ?? defaultPreset.params.midShape,
      u_density: props.density ?? defaultPreset.params.density,
      u_frequency: props.frequency ?? defaultPreset.params.frequency,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.offsetX,
    props.offsetY,
    props.spotty,
    props.light,
    props.midShape,
    props.density,
    props.frequency,
  ]);

  return <ShaderMount {...props} fragmentShader={godRaysFragmentShader} uniforms={uniforms} />;
};
