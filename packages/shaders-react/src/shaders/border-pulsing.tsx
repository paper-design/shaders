import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  borderPulsingFragmentShader,
  type BorderPulsingUniforms,
} from '@paper-design/shaders';

export type BorderPulsingParams = {
  colorBack?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  innerShapeIntensity?: number;
  spotsNumber?: number;
  intensity?: number;
  pulsing?: number;
  grain?: number;
  pxSize?: number;
} & GlobalParams;

export type BorderPulsingProps = Omit<ShaderMountProps, 'fragmentShader'> & BorderPulsingParams;

type BorderPulsingPreset = { name: string; params: Required<BorderPulsingParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: BorderPulsingPreset = {
  name: 'Default',
  params: {
    colorBack: 'hsla(200, 0%, 0%, 1)',
    color1: 'hsla(30, 100%, 50%, 1)',
    color2: 'hsla(240, 100%, 50%, 1)',
    color3: 'hsla(320, 100%, 50%, 1)',
    pxSize: 50,
    intensity: 2,
    pulsing: 0.5,
    innerShapeIntensity: 0.4,
    spotsNumber: 5,
    grain: 0,
    speed: 1,
    seed: 0,
  },
} as const;

export const northernPreset: BorderPulsingPreset = {
  name: 'Northern Lights',
  params: {
    colorBack: 'hsla(200, 0%, 0%, 1)',
    color1: 'hsla(80, 100%, 70%, 1)',
    color2: 'hsla(150, 100%, 50%, 1)',
    color3: 'hsla(240, 100%, 50%, 1)',
    pxSize: 175,
    intensity: 0.45,
    pulsing: 0,
    innerShapeIntensity: 0.3,
    spotsNumber: 3,
    grain: 0,
    speed: 1,
    seed: 0,
  },
} as const;

export const warmPreset: BorderPulsingPreset = {
  name: 'Warm',
  params: {
    colorBack: 'hsla(47, 100%, 88%, 1)',
    color1: 'hsla(27, 100%, 11%, 1)',
    color2: 'hsla(30, 100%, 40%, 1)',
    color3: 'hsla(350, 100%, 15%, 1)',
    pxSize: 250,
    intensity: 3,
    pulsing: 0,
    innerShapeIntensity: 0.3,
    spotsNumber: 4,
    grain: 0.5,
    speed: 0,
    seed: 1300,
  },
} as const;

export const borderPulsingPresets: BorderPulsingPreset[] = [defaultPreset, northernPreset, warmPreset] as const;

export const BorderPulsing = (props: BorderPulsingProps): JSX.Element => {
  const uniforms: BorderPulsingUniforms = useMemo(() => {
    return {
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_innerShapeIntensity: props.innerShapeIntensity ?? defaultPreset.params.innerShapeIntensity,
      u_spotsNumber: props.spotsNumber ?? defaultPreset.params.spotsNumber,
      u_intensity: props.intensity ?? defaultPreset.params.intensity,
      u_pulsing: props.pulsing ?? defaultPreset.params.pulsing,
      u_grain: props.grain ?? defaultPreset.params.grain,
      u_pxSize: props.pxSize ?? defaultPreset.params.pxSize,
    };
  }, [
    props.colorBack,
    props.color1,
    props.color2,
    props.color3,
    props.pxSize,
    props.innerShapeIntensity,
    props.spotsNumber,
    props.intensity,
    props.pulsing,
    props.grain,
  ]);

  return <ShaderMount {...props} fragmentShader={borderPulsingFragmentShader} uniforms={uniforms} />;
};
