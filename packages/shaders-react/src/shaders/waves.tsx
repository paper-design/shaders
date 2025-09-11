import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
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

export const defaultPreset: WavesPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    scale: 0.6,
    colorFront: '#ffbb00',
    colorBack: '#000000',
    shape: 0,
    frequency: 0.5,
    amplitude: 0.5,
    spacing: 1.2,
    proportion: 0.1,
    softness: 0,
  },
};

export const groovyPreset: WavesPreset = {
  name: 'Groovy',
  params: {
    ...defaultPatternSizing,
    scale: 5,
    rotation: 90,
    colorFront: '#fcfcee',
    colorBack: '#ff896b',
    shape: 3,
    frequency: 0.2,
    amplitude: 0.25,
    spacing: 1.17,
    proportion: 0.57,
    softness: 0,
  },
};

export const tangledUpPreset: WavesPreset = {
  name: 'Tangled up',
  params: {
    ...defaultPatternSizing,
    scale: 0.5,
    rotation: 0,
    colorFront: '#133a41',
    colorBack: '#c2d8b6',
    shape: 2.07,
    frequency: 0.44,
    amplitude: 0.57,
    spacing: 1.05,
    proportion: 0.75,
    softness: 0,
  },
};

export const waveRidePreset: WavesPreset = {
  name: 'Ride the wave',
  params: {
    ...defaultPatternSizing,
    scale: 1.7,
    rotation: 0,
    colorFront: '#fdffe6',
    colorBack: '#1f1f1f',
    shape: 2.25,
    frequency: 0.2,
    amplitude: 1,
    spacing: 1.25,
    proportion: 1,
    softness: 0,
  },
};

export const wavesPresets: WavesPreset[] = [defaultPreset, groovyPreset, tangledUpPreset, waveRidePreset];

export const Waves: React.FC<WavesProps> = memo(function WavesImpl({
  // Own props
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
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
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
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
