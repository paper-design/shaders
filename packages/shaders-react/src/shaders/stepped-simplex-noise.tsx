import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  steppedSimplexNoiseFragmentShader,
  type SteppedSimplexNoiseUniforms,
} from '@paper-design/shaders';

export type SteppedSimplexNoiseParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
  stepsNumber?: number;
  worldWidth?: number;
  worldHeight?: number;
} & GlobalParams;

export type SteppedSimplexNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & SteppedSimplexNoiseParams;

type SteppedSimplexNoisePreset = { name: string; params: Required<SteppedSimplexNoiseParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: SteppedSimplexNoisePreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.15,
    seed: 0,
    color1: 'hsla(208, 25%, 45%, 1)',
    color2: 'hsla(94, 38%, 59%, 1)',
    color3: 'hsla(359, 94%, 62%, 1)',
    color4: 'hsla(42, 93%, 64%, 1)',
    color5: 'hsla(0, 0%, 100%, 1)',
    stepsNumber: 13,
    worldWidth: 500,
    worldHeight: 500,
  },
} as const;


export const steppedSimplexNoisePresets: SteppedSimplexNoisePreset[] = [
  defaultPreset,
];

export const SteppedSimplexNoise = (props: SteppedSimplexNoiseProps): JSX.Element => {
  const uniforms: SteppedSimplexNoiseUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
      u_color5: getShaderColorFromString(props.color5, defaultPreset.params.color5),
      u_steps_number: props.stepsNumber ?? defaultPreset.params.stepsNumber,
      u_worldWidth: props.worldWidth ?? defaultPreset.params.worldWidth,
      u_worldHeight: props.worldHeight ?? defaultPreset.params.worldHeight,
    };
  }, [props.scale, props.color1, props.color2, props.color3, props.color4, props.color5, props.stepsNumber, props.worldWidth, props.worldHeight]);

  return <ShaderMount {...props} fragmentShader={steppedSimplexNoiseFragmentShader} uniforms={uniforms} />;
};
