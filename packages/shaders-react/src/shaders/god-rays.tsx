import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, godRaysFragmentShader, type GodRaysUniforms } from '@paper-design/shaders';

export type GodRaysParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  offsetX?: number;
  offsetY?: number;
  spotty?: number;
  midIntensity?: number;
  midSize?: number;
  density?: number;
  blending?: number;
  frequency?: number;
} & GlobalParams;

export type GodRaysProps = Omit<ShaderMountProps, 'fragmentShader'> & GodRaysParams;

type GodRaysPreset = { name: string; params: Required<GodRaysParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highmidIntensity bug)

export const defaultPreset: GodRaysPreset = {
  name: 'Default',
  params: {
    colorBack: 'hsla(215, 100%, 11%, 1)',
    color1: 'hsla(45, 100%, 70%, 1)',
    color2: 'hsla(10, 100%, 80%, 1)',
    color3: 'hsla(178, 100%, 83%, 1)',
    offsetX: -0.4,
    offsetY: -0.4,
    spotty: 0.28,
    midIntensity: 0.97,
    midSize: 2,
    density: 0.3,
    blending: 0,
    frequency: 6,
    speed: 1,
    seed: 0,
  },
} as const;

export const preset1: GodRaysPreset = {
  name: 'Preset #1',
  params: {
    colorBack: 'hsla(0, 35%, 32%, 1)',
    color1: 'hsla(196, 100%, 50%, 1)',
    color2: 'hsla(239, 100%, 50%, 1)',
    color3: 'hsla(38, 91%, 50%, 1)',
    offsetX: 0,
    offsetY: .75,
    spotty: 0.45,
    midIntensity: 0.97,
    midSize: 1.5,
    density: 0.7,
    blending: 1,
    frequency: 18,
    speed: 1,
    seed: 0,
  },
} as const;

export const preset2: GodRaysPreset = {
  name: 'Preset #2',
  params: {
    colorBack: 'hsla(164, 14%, 15%, 1)',
    color1: 'hsla(239, 100%, 50%, 1)',
    color2: 'hsla(150, 100%, 50%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    offsetX: 0,
    offsetY: 0,
    spotty: 0.15,
    midIntensity: 0,
    midSize: 0,
    density: 0.79,
    blending: 0.4,
    frequency: 1.2,
    speed: 0,
    seed: 0,
  },
} as const;

export const godRaysPresets: GodRaysPreset[] = [defaultPreset, preset1, preset2];

export const GodRays = (props: GodRaysProps): JSX.Element => {
  const uniforms: GodRaysUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_offsetX: props.offsetX ?? defaultPreset.params.offsetX,
      u_offsetY: props.offsetY ?? defaultPreset.params.offsetY,
      u_spotty: props.spotty ?? defaultPreset.params.spotty,
      u_midIntensity: props.midIntensity ?? defaultPreset.params.midIntensity,
      u_midSize: props.midSize ?? defaultPreset.params.midSize,
      u_density: props.density ?? defaultPreset.params.density,
      u_blending: props.blending ?? defaultPreset.params.blending,
      u_frequency: props.frequency ?? defaultPreset.params.frequency,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.color3,
    props.offsetX,
    props.offsetY,
    props.spotty,
    props.midIntensity,
    props.midSize,
    props.density,
    props.blending,
    props.frequency,
  ]);

  return <ShaderMount {...props} fragmentShader={godRaysFragmentShader} uniforms={uniforms} />;
};
