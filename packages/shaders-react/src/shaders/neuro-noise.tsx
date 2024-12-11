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
    colorFront: 'rgba(195, 163, 255, 1)',
    colorBack: 'rgba(0, 0, 0, 1)',
    scale: 0.7,
    speed: 1,
    brightness: 1.3,
  },
} as const;

const marblePreset: NeuroNoisePreset = {
  name: 'Marble',
  params: {
    colorFront: 'rgba(29, 32, 47, 1)',
    colorBack: 'rgba(247, 247, 247, 1)',
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
