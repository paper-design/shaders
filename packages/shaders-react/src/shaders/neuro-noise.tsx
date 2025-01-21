import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, neuroNoiseFragmentShader, type NeuroNoiseUniforms } from '@paper-design/shaders';

export type NeuroNoiseParams = {
  scale?: number;
  colorFront?: string;
  colorBack?: string;
  brightness?: number;
} & GlobalParams;

export type NeuroNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & NeuroNoiseParams;

type NeuroNoisePreset = { name: string; params: Required<NeuroNoiseParams> };

export const defaultPreset: NeuroNoisePreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    scale: 1,
    speed: 1,
    seed: 0,
    colorFront: 'hsla(261, 100%, 82%, 1)',
    colorBack: 'hsla(0, 0%, 0%, 1)',
    brightness: 1.3,
  },
} as const;

const marblePreset: NeuroNoisePreset = {
  name: 'Marble',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    scale: 0.4,
    speed: 0,
    seed: 0,
    colorFront: 'hsla(230, 24%, 15%, 1)',
    colorBack: 'hsla(0, 0%, 97%, 1)',
    brightness: 1.1,
  },
} as const;

export const neuroNoisePresets: NeuroNoisePreset[] = [defaultPreset, marblePreset] as const;

export const NeuroNoise = (props: NeuroNoiseProps): JSX.Element => {
  const uniforms: NeuroNoiseUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_seed: props.seed ?? defaultPreset.params.seed,
      u_colorFront: getShaderColorFromString(props.colorFront, defaultPreset.params.colorFront),
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_brightness: props.brightness ?? defaultPreset.params.brightness,
    };
  }, [props.scale, props.speed, props.seed, props.colorFront, props.colorBack, props.brightness]);

  return <ShaderMount {...props} fragmentShader={neuroNoiseFragmentShader} uniforms={uniforms} />;
};
