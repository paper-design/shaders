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
  frequency?: number;
  spotty?: number;
  midIntensity?: number;
  midSize?: number;
  density?: number;
  blending?: number;
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
    offsetX: -0.6,
    offsetY: -0.6,
    frequency: 6,
    spotty: 0.28,
    midIntensity: 0.97,
    midSize: 2,
    density: 0.3,
    blending: 0,
    speed: 1,
    seed: 0,
  },
} as const;

export const auroraPreset: GodRaysPreset = {
  name: 'Aurora',
  params: {
    colorBack: 'hsla(0, 0%, 25%, 1)',
    color1: 'hsla(239, 100%, 70%, 1)',
    color2: 'hsla(150, 100%, 70%, 1)',
    color3: 'hsla(200, 100%, 70%, 1)',
    offsetX: 0,
    offsetY: 1,
    frequency: 2.4,
    spotty: 0.9,
    midIntensity: 0.8,
    midSize: 2.1,
    density: 0.5,
    blending: 1,
    speed: 1,
    seed: 0,
  },
} as const;

export const spacePreset: GodRaysPreset = {
  name: 'Space',
  params: {
    colorBack: 'hsla(0, 0%, 0%, 1)',
    color1: 'hsla(317, 100%, 50%, 1)',
    color2: 'hsla(25, 100%, 50%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    offsetX: 0,
    offsetY: 0,
    frequency: 1.2,
    spotty: 0.15,
    midIntensity: 0,
    midSize: 0,
    density: 0.79,
    blending: 0.4,
    speed: 2,
    seed: 0,
  },
} as const;

export const godRaysPresets: GodRaysPreset[] = [defaultPreset, auroraPreset, spacePreset];

export const GodRays = (props: GodRaysProps): JSX.Element => {
  const uniforms: GodRaysUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_offsetX: props.offsetX ?? defaultPreset.params.offsetX,
      u_offsetY: props.offsetY ?? defaultPreset.params.offsetY,
      u_frequency: props.frequency ?? defaultPreset.params.frequency,
      u_spotty: props.spotty ?? defaultPreset.params.spotty,
      u_midIntensity: props.midIntensity ?? defaultPreset.params.midIntensity,
      u_midSize: props.midSize ?? defaultPreset.params.midSize,
      u_density: props.density ?? defaultPreset.params.density,
      u_blending: props.blending ?? defaultPreset.params.blending,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.color3,
    props.offsetX,
    props.offsetY,
    props.frequency,
    props.spotty,
    props.midIntensity,
    props.midSize,
    props.density,
    props.blending,
  ]);

  return <ShaderMount {...props} fragmentShader={godRaysFragmentShader} uniforms={uniforms} />;
};
