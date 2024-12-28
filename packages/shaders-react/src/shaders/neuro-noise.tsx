import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, neuroNoiseFragmentShader, type NeuroNoiseUniforms } from '@paper-design/shaders';

export type NeuroNoiseParams = {
  colorFront?: string;
  colorBack?: string;
  scale?: number;
  brightness?: number;
} & GlobalParams;

export type NeuroNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & NeuroNoiseParams;

type NeuroNoisePreset = { name: string; params: Required<NeuroNoiseParams> };

export const defaultPreset: NeuroNoisePreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    colorFront: 'hsla(261, 100%, 82%, 1)',
    colorBack: 'hsla(0, 0%, 0%, 1)',
    scale: 1,
    speed: 1,
    brightness: 1.3,
    seed: 0,
  },
} as const;

const marblePreset: NeuroNoisePreset = {
  name: 'Marble',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    colorFront: 'hsla(230, 24%, 15%, 1)',
    colorBack: 'hsla(0, 0%, 97%, 1)',
    scale: 0.4,
    speed: 0,
    brightness: 1.1,
    seed: 0,
  },
} as const;

export const neuroNoisePresets: NeuroNoisePreset[] = [defaultPreset, marblePreset] as const;

export const NeuroNoise = (props: NeuroNoiseProps): JSX.Element => {
  const uniforms: NeuroNoiseUniforms = useMemo(() => {
    return {
      u_colorFront: getShaderColorFromString(props.colorFront, defaultPreset.params.colorFront),
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_speed: props.speed ?? defaultPreset.params.speed,
      u_brightness: props.brightness ?? defaultPreset.params.brightness,
      u_seed: props.seed ?? defaultPreset.params.seed,
    };
  }, [props.colorFront, props.colorBack, props.scale, props.speed, props.brightness, props.seed]);

  return <ShaderMount {...props} fragmentShader={neuroNoiseFragmentShader} uniforms={uniforms} />;
};
