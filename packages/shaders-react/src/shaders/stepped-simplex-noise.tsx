import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  steppedSimplexNoiseFragmentShader,
  type SteppedSimplexNoiseUniforms,
} from '@paper-design/shaders';

export type SteppedSimplexNoiseParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
  scale?: number;
  stepsNumber?: number;
} & GlobalParams;

export type SteppedSimplexNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & SteppedSimplexNoiseParams;

type SteppedSimplexNoisePreset = { name: string; params: Required<SteppedSimplexNoiseParams> };

export const defaultPreset: SteppedSimplexNoisePreset = {
  name: 'Default',
  params: {
    color1: 'hsla(208.42, 24.68%, 45.29%, 1)',
    color2: 'hsla(94.07, 38.39%, 58.63%, 1)',
    color3: 'hsla(359.02, 93.88%, 61.57%, 1)',
    color4: 'hsla(42.35, 93.41%, 64.31%, 1)',
    color5: 'hsla(0, 0%, 100%, 1)',
    scale: 0.5,
    speed: 0.6,
    stepsNumber: 13,
  },
} as const;

const magmaPreset: SteppedSimplexNoisePreset = {
  name: 'Magma',
  params: {
    color1: 'hsla(0, 100%, 36.47%, 1)',
    color2: 'hsla(0, 95.54%, 43.92%, 1)',
    color3: 'hsla(20.08, 100%, 48.63%, 1)',
    color4: 'hsla(45, 100%, 45.49%, 1)',
    color5: 'hsla(31.87, 100%, 93.73%, 1)',
    speed: 0.2,
    scale: 2,
    stepsNumber: 8,
  },
};

export const steppedSimplexNoisePresets: SteppedSimplexNoisePreset[] = [defaultPreset, magmaPreset];

export const SteppedSimplexNoise = (props: SteppedSimplexNoiseProps): JSX.Element => {
  const uniforms: SteppedSimplexNoiseUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
      u_color5: getShaderColorFromString(props.color5, defaultPreset.params.color5),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_steps_number: props.stepsNumber ?? defaultPreset.params.stepsNumber,
    };
  }, [
    props.color1,
    props.color2,
    props.color3,
    props.color4,
    props.color5,
    props.scale,
    props.speed,
    props.stepsNumber,
  ]);

  return <ShaderMount {...props} fragmentShader={steppedSimplexNoiseFragmentShader} uniforms={uniforms} />;
};
