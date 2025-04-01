import { useMemo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  wavesFragmentShader,
  ShaderFitOptions,
  type WavesParams,
  type WavesUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface WavesProps extends ShaderComponentProps, WavesParams {}

type WavesPreset = ShaderPreset<WavesParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: WavesPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    scale: 1.6,
    rotation: 0,
    color1: 'hsla(0, 0%, 100%, 1)',
    color2: 'hsla(225, 75%, 24%, 1)',
    shape: 0,
    frequency: 0.5,
    amplitude: 0.6,
    spacing: 0.65,
    dutyCycle: 0.15,
    softness: 0,
  },
};

export const spikesPreset: WavesPreset = {
  name: 'Spikes',
  params: {
    ...defaultPatternSizing,
    scale: 2.3,
    rotation: 0,
    color1: 'hsla(65, 100%, 95%, 1)',
    color2: 'hsla(290, 52%, 15%, 1)',
    shape: 0,
    frequency: 0.5,
    amplitude: 0.9,
    spacing: 0.37,
    dutyCycle: 0.93,
    softness: 0.15,
  },
};

export const groovyPreset: WavesPreset = {
  name: 'Groovy',
  params: {
    ...defaultPatternSizing,
    scale: 0.5,
    rotation: 1,
    color1: 'hsla(60, 100%, 97%, 1)',
    color2: 'hsla(20, 100%, 71%, 1)',
    shape: 2.37,
    frequency: 0.2,
    amplitude: 0.67,
    spacing: 1.17,
    dutyCycle: 0.57,
    softness: 0,
  },
};

export const tangledUpPreset: WavesPreset = {
  name: 'Tangled up',
  params: {
    ...defaultPatternSizing,
    scale: 3.04,
    rotation: 1,
    color1: 'hsla(198.7, 66.7%, 14.1%, 1)',
    color2: 'hsla(85.5, 35.7%, 78%, 1)',
    shape: 3,
    frequency: 0.44,
    amplitude: 0.57,
    spacing: 1.05,
    dutyCycle: 0.97,
    softness: 0,
  },
};

export const zigZagPreset: WavesPreset = {
  name: 'Zig zag',
  params: {
    ...defaultPatternSizing,
    scale: 2.7,
    rotation: 1,
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(0, 0%, 90%, 1)',
    shape: 0,
    frequency: 0.6,
    amplitude: 0.8,
    spacing: 0.5,
    dutyCycle: 1,
    softness: 0.5,
  },
};

export const waveRidePreset: WavesPreset = {
  name: 'Ride the wave',
  params: {
    ...defaultPatternSizing,
    scale: 0.84,
    rotation: 0,
    color1: 'hsla(65, 100%, 95%, 1)',
    color2: 'hsla(0, 0%, 12%, 1)',
    shape: 2.23,
    frequency: 0.1,
    amplitude: 0.6,
    spacing: 0.41,
    dutyCycle: 0.99,
    softness: 0,
  },
};

export const wavesPresets: WavesPreset[] = [
  defaultPreset,
  spikesPreset,
  groovyPreset,
  tangledUpPreset,
  zigZagPreset,
  waveRidePreset,
];

export const Waves = ({
  // Own props
  rotation = defaultPreset.params.rotation,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  shape = defaultPreset.params.shape,
  frequency = defaultPreset.params.frequency,
  amplitude = defaultPreset.params.amplitude,
  spacing = defaultPreset.params.spacing,
  dutyCycle = defaultPreset.params.dutyCycle,
  softness = defaultPreset.params.softness,

  // Sizing props
  fit = defaultPreset.params.fit,
  scale = defaultPreset.params.scale,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: WavesProps): React.ReactElement => {
  const uniforms = useMemo(() => {
    return {
      // Own uniforms
      u_rotation: rotation,
      u_color1: getShaderColorFromString(color1),
      u_color2: getShaderColorFromString(color2),
      u_shape: shape,
      u_frequency: frequency,
      u_amplitude: amplitude,
      u_spacing: spacing,
      u_dutyCycle: dutyCycle,
      u_softness: softness,

      // Sizing uniforms
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies WavesUniforms;
  }, [
    // Own props
    rotation,
    color1,
    color2,
    shape,
    frequency,
    amplitude,
    spacing,
    dutyCycle,
    softness,

    // Sizing props
    fit,
    scale,
    offsetX,
    offsetY,
    originX,
    originY,
    worldWidth,
    worldHeight,
  ]);

  return <ShaderMount {...props} fragmentShader={wavesFragmentShader} uniforms={uniforms} />;
};
