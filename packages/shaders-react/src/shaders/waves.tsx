import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
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
    color1: '#ffffff',
    color2: '#102c70',
    shape: 0,
    frequency: 0.5,
    amplitude: 0.6,
    spacing: 0.65,
    proportion: 0.15,
    softness: 0,
  },
};

export const spikesPreset: WavesPreset = {
  name: 'Spikes',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 2.3,
    rotation: 0,
    color1: '#fdffe6',
    color2: '#34123b',
    shape: 0,
    frequency: 0.5,
    amplitude: 0.9,
    spacing: 0.37,
    proportion: 0.93,
    softness: 0.15,
  },
};

export const groovyPreset: WavesPreset = {
  name: 'Groovy',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.5,
    rotation: 1,
    color1: '#fcfcee',
    color2: '#ff896b',
    shape: 2.37,
    frequency: 0.2,
    amplitude: 0.67,
    spacing: 1.17,
    proportion: 0.57,
    softness: 0,
  },
};

export const tangledUpPreset: WavesPreset = {
  name: 'Tangled up',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 3.04,
    rotation: 1,
    color1: '#133a41',
    color2: '#c2d8b6',
    shape: 3,
    frequency: 0.44,
    amplitude: 0.57,
    spacing: 1.05,
    proportion: 0.97,
    softness: 0,
  },
};

export const zigZagPreset: WavesPreset = {
  name: 'Zig zag',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 2.7,
    rotation: 1,
    color1: '#000000',
    color2: '#e6e6e6',
    shape: 0,
    frequency: 0.6,
    amplitude: 0.8,
    spacing: 0.5,
    proportion: 1,
    softness: 0.5,
  },
};

export const waveRidePreset: WavesPreset = {
  name: 'Ride the wave',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.84,
    rotation: 0,
    color1: '#fdffe6',
    color2: '#1f1f1f',
    shape: 2.23,
    frequency: 0.1,
    amplitude: 0.6,
    spacing: 0.41,
    proportion: 0.99,
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

export const Waves: React.FC<WavesProps> = memo(function WavesImpl({
  // Own props
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  shape = defaultPreset.params.shape,
  frequency = defaultPreset.params.frequency,
  amplitude = defaultPreset.params.amplitude,
  spacing = defaultPreset.params.spacing,
  proportion = defaultPreset.params.proportion,
  softness = defaultPreset.params.softness,

  // Sizing props
  fit = defaultPreset.params.fit,
  scale = defaultPreset.params.scale,
  rotation = defaultPreset.params.rotation,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,

  // Other props
  maxPixelCount = 6016 * 3384, // Higher max resolution for this shader
  ...props
}: WavesProps) {
  const uniforms = {
    // Own uniforms
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_shape: shape,
    u_frequency: frequency,
    u_amplitude: amplitude,
    u_spacing: spacing,
    u_proportion: proportion,
    u_softness: softness,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_scale: scale,
    u_rotation: rotation,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies WavesUniforms;

  return <ShaderMount {...props} fragmentShader={wavesFragmentShader} uniforms={uniforms} />;
}, colorPropsAreEqual);
