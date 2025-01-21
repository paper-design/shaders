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
} & GlobalParams;

export type SteppedSimplexNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & SteppedSimplexNoiseParams;

type SteppedSimplexNoisePreset = { name: string; params: Required<SteppedSimplexNoiseParams> };

export const defaultPreset: SteppedSimplexNoisePreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    scale: 1,
    speed: 0.15,
    seed: 0,
    color1: 'hsla(208, 25%, 45%, 1)',
    color2: 'hsla(94, 38%, 59%, 1)',
    color3: 'hsla(359, 94%, 62%, 1)',
    color4: 'hsla(42, 93%, 64%, 1)',
    color5: 'hsla(0, 0%, 100%, 1)',
    stepsNumber: 13,
  },
} as const;

const magmaPreset: SteppedSimplexNoisePreset = {
  name: 'Magma',
  params: {
    scale: 0.3,
    speed: 0.2,
    seed: 0,
    color1: 'hsla(0, 100%, 36%, 1)',
    color2: 'hsla(0, 95%, 44%, 1)',
    color3: 'hsla(20, 100%, 49%, 1)',
    color4: 'hsla(45, 100%, 45%, 1)',
    color5: 'hsla(31, 100%, 94%, 1)',
    stepsNumber: 8,
  },
};

const bloodCellPreset: SteppedSimplexNoisePreset = {
  name: 'Blood cell',
  params: {
    scale: 1.2,
    speed: 0.22,
    seed: 0,
    color1: 'hsla(302, 43%, 13%, 1)',
    color2: 'hsla(325, 93%, 17%, 1)',
    color3: 'hsla(338, 80%, 25%, 1)',
    color4: 'hsla(338, 80%, 25%, 1)',
    color5: 'hsla(2, 85%, 72%, 1)',
    stepsNumber: 29,
  },
};

const firstContactPreset: SteppedSimplexNoisePreset = {
  name: 'First contact',
  params: {
    scale: 1.2,
    speed: -0.1,
    seed: 0,
    color1: 'hsla(300, 43%, 82%, 1)',
    color2: 'hsla(266, 70%, 9%, 1)',
    color3: 'hsla(289, 36%, 26%, 1)',
    color4: 'hsla(0, 41%, 78%, 1)',
    color5: 'hsla(0, 100%, 96%, 1)',
    stepsNumber: 40,
  },
};

export const steppedSimplexNoisePresets: SteppedSimplexNoisePreset[] = [
  defaultPreset,
  magmaPreset,
  bloodCellPreset,
  firstContactPreset,
];

export const SteppedSimplexNoise = (props: SteppedSimplexNoiseProps): JSX.Element => {
  const uniforms: SteppedSimplexNoiseUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_seed: props.seed ?? defaultPreset.params.seed,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(props.color4, defaultPreset.params.color4),
      u_color5: getShaderColorFromString(props.color5, defaultPreset.params.color5),
      u_steps_number: props.stepsNumber ?? defaultPreset.params.stepsNumber,
    };
  }, [
    props.scale,
    props.speed,
    props.seed,
    props.color1,
    props.color2,
    props.color3,
    props.color4,
    props.color5,
    props.stepsNumber,
  ]);

  return <ShaderMount {...props} fragmentShader={steppedSimplexNoiseFragmentShader} uniforms={uniforms} />;
};
