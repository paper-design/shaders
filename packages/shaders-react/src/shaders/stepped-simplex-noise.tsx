import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
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
  speed?: number;
  stepsNumber?: number;
};

export type SteppedSimplexNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & SteppedSimplexNoiseParams;

type SteppedSimplexNoisePreset = { name: string; params: Required<SteppedSimplexNoiseParams> };

export const defaultPreset: SteppedSimplexNoisePreset = {
  name: 'Default',
  params: {
    color1: '#577590',
    color2: '#90BE6D',
    color3: '#F94144',
    color4: '#F9C74F',
    color5: '#ffffff',
    scale: 0.5,
    speed: 0.6,
    stepsNumber: 13,
  },
} as const;

const magmaPreset: SteppedSimplexNoisePreset = {
  name: 'Magma',
  params: {
    color1: '#ba0000',
    color2: '#db0505',
    color3: '#f85300',
    color4: '#e8ae00',
    color5: '#fff0df',
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
