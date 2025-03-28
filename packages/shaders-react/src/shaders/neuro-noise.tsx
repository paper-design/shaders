import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, neuroNoiseFragmentShader, type NeuroNoiseUniforms } from '@paper-design/shaders';

export type NeuroNoiseParams = {
  scale?: number;
  colorFront?: string;
  colorBack?: string;
  brightness?: number;
} & GlobalParams;

export type NeuroNoiseProps = Omit<Partial<ShaderMountProps>, 'fragmentShader'> & NeuroNoiseParams;

type NeuroNoisePreset = { name: string; params: Required<NeuroNoiseParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: NeuroNoisePreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 1,
    frame: 0,
    colorFront: 'hsla(261, 100%, 82%, 1)',
    colorBack: 'hsla(0, 0%, 0%, 1)',
    brightness: 1.3,
  },
};

const marblePreset: NeuroNoisePreset = {
  name: 'Marble',
  params: {
    scale: 0.4,
    speed: 0,
    frame: 0,
    colorFront: 'hsla(230, 24%, 15%, 1)',
    colorBack: 'hsla(0, 0%, 97%, 1)',
    brightness: 1.1,
  },
};

export const neuroNoisePresets: NeuroNoisePreset[] = [defaultPreset, marblePreset] as const;

export const NeuroNoise = ({
  scale,
  colorFront,
  colorBack,
  brightness,
  worldFit = 'crop',
  worldWidth = Infinity,
  worldHeight = Infinity,
  ...props
}: NeuroNoiseProps): React.ReactElement => {
  const uniforms: NeuroNoiseUniforms = useMemo(() => {
    return {
      u_scale: scale ?? defaultPreset.params.scale,
      u_colorFront: getShaderColorFromString(colorFront, defaultPreset.params.colorFront),
      u_colorBack: getShaderColorFromString(colorBack, defaultPreset.params.colorBack),
      u_brightness: brightness ?? defaultPreset.params.brightness,
    };
  }, [scale, colorFront, colorBack, brightness]);

  return (
    <ShaderMount
      {...props}
      worldFit={worldFit}
      worldWidth={worldWidth}
      worldHeight={worldHeight}
      fragmentShader={neuroNoiseFragmentShader}
      uniforms={uniforms}
    />
  );
};
