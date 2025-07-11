import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  ShaderFitOptions,
  spiralFragmentShader,
  type ShaderPreset,
  type SpiralParams,
  type SpiralUniforms,
} from '@paper-design/shaders';

export interface SpiralProps extends ShaderComponentProps, SpiralParams {}

type SpiralPreset = ShaderPreset<SpiralParams>;

export const defaultPreset: SpiralPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    colorBack: '#a1ef2a',
    colorFront: '#288918',
    density: 0.6,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noise: 1,
    noiseFrequency: 0.25,
    softness: 0,
    speed: 0.75,
    frame: 0,
  },
};

export const dropletPreset: SpiralPreset = {
  name: 'Droplet',
  params: {
    ...defaultPatternSizing,
    colorBack: '#effafe',
    colorFront: '#bf40a0',
    density: 0.1,
    distortion: 0,
    strokeWidth: 0.25,
    strokeTaper: 0.4,
    strokeCap: 1,
    noise: 0.74,
    noiseFrequency: 0.33,
    softness: 0,
    speed: 1,
    frame: 0,
  },
};

export const sandPreset: SpiralPreset = {
  name: 'Sand',
  params: {
    ...defaultPatternSizing,
    colorBack: '#ffffff',
    colorFront: '#a09560',
    density: 0,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noise: 1,
    noiseFrequency: 1,
    softness: 1,
    speed: 0,
    frame: 0,
  },
};

export const swirlPreset: SpiralPreset = {
  name: 'Swirl',
  params: {
    ...defaultPatternSizing,
    colorBack: '#b3e6d9',
    colorFront: '#1a2b4d',
    density: 0.8,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noise: 0,
    noiseFrequency: 0.3,
    softness: 0.5,
    speed: 1,
    frame: 0,
  },
};

export const vinylPreset: SpiralPreset = {
  name: 'Vinyl',
  params: {
    ...defaultPatternSizing,
    colorBack: '#c2babb',
    colorFront: '#262626',
    density: 0,
    distortion: 1,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 1,
    noise: 0,
    noiseFrequency: 0.3,
    softness: 0,
    speed: 0.5,
    frame: 0,
  },
};

export const spiralPresets: SpiralPreset[] = [defaultPreset, sandPreset, dropletPreset, swirlPreset, vinylPreset];

export const Spiral: React.FC<SpiralProps> = memo(function SpiralImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorFront = defaultPreset.params.colorFront,
  density = defaultPreset.params.density,
  distortion = defaultPreset.params.distortion,
  strokeWidth = defaultPreset.params.strokeWidth,
  strokeTaper = defaultPreset.params.strokeTaper,
  strokeCap = defaultPreset.params.strokeCap,
  noiseFrequency = defaultPreset.params.noiseFrequency,
  noise = defaultPreset.params.noise,
  softness = defaultPreset.params.softness,

  // Sizing props
  fit = defaultPreset.params.fit,
  rotation = defaultPreset.params.rotation,
  scale = defaultPreset.params.scale,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: SpiralProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFront: getShaderColorFromString(colorFront),
    u_density: density,
    u_distortion: distortion,
    u_strokeWidth: strokeWidth,
    u_strokeTaper: strokeTaper,
    u_strokeCap: strokeCap,
    u_noiseFrequency: noiseFrequency,
    u_noise: noise,
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
  } satisfies SpiralUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={spiralFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
