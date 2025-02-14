import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';

export type NeuroNoiseParams = {
  scale?: number;
  colorFront?: string;
  colorBack?: string;
  brightness?: number;
} & GlobalParams;

export type NeuroNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & NeuroNoiseParams;

type NeuroNoisePreset = { name: string; params: Required<NeuroNoiseParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: NeuroNoisePreset = {
  name: 'Default',
  params: {
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
  const uniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_colorFront: getShaderColorFromString(props.colorFront, defaultPreset.params.colorFront),
      u_colorBack: getShaderColorFromString(props.colorBack, defaultPreset.params.colorBack),
      u_brightness: props.brightness ?? defaultPreset.params.brightness,
    };
  }, [props.scale, props.colorFront, props.colorBack, props.brightness]);

  return <ShaderMount {...props} fragmentShader={neuroNoiseFragmentShader} uniforms={uniforms} />;
};
