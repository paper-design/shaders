import { useMemo } from 'react';
import { ShaderMount, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, neuroNoiseFragmentShader, type NeuroNoiseUniforms } from '@paper-design/shaders';

export type NeuroNoiseParams = {
  colorFront?: string;
  colorBack?: string;
  scale?: number;
  speed?: number;
  brightness?: number;
};

export type NeuroNoiseProps = Omit<ShaderMountProps, 'fragmentShader'> & NeuroNoiseParams;

type NeuroNoisePreset = { name: string; params: Required<NeuroNoiseParams> };

export const defaultPreset: NeuroNoisePreset = {
  name: 'Default',
  params: {
    colorFront: '#c3a3ff',
    colorBack: '#000000',
    scale: .7,
    speed: 1,
    brightness: 1.3,
  },
} as const;

const marblePreset: NeuroNoisePreset = {
  name: 'Marble',
  params: {
    colorFront: '#1d202f',
    colorBack: '#f7f7f7',
    scale: 1.2,
    speed: 0,
    brightness: 1.1,
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
    };
  }, [props.colorFront, props.colorBack, props.scale, props.speed, props.brightness]);

  return <ShaderMount {...props} fragmentShader={neuroNoiseFragmentShader} uniforms={uniforms} />;
};
