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
    colorBack: '#fafafa',
    colorFront: '#808080',
    density: 0,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noiseFrequency: 0,
    noisePower: 0,
    softness: 0.01,
    speed: 1,
    frame: 0,
  },
};

export const noisyPreset: SpiralPreset = {
  name: 'Noisy',
  params: {
    ...defaultPatternSizing,
    colorBack: '#a1ef2a',
    colorFront: '#288918',
    scale: 1.3,
    density: 0.5,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0.5,
    noiseFrequency: 0.1,
    noisePower: 1,
    softness: 0,
    speed: 1,
    frame: 0,
  },
};

export const dropletPreset: SpiralPreset = {
  name: 'Droplet',
  params: {
    ...defaultPatternSizing,
    colorBack: '#effafe',
    colorFront: '#bf40a0',
    scale: 0.65,
    density: 0,
    distortion: 0,
    strokeWidth: 0.05,
    strokeTaper: 0,
    strokeCap: 1,
    noiseFrequency: 0,
    noisePower: 0,
    softness: 0,
    speed: 1,
    frame: 0,
  },
};

export const sandPreset: SpiralPreset = {
  name: 'Sand',
  params: {
    ...defaultPatternSizing,
    colorBack: '#dedede',
    colorFront: '#a09560',
    scale: 0.75,
    density: 0,
    distortion: 0,
    strokeWidth: 0.15,
    strokeTaper: 0,
    strokeCap: 0,
    noiseFrequency: 30,
    noisePower: 1,
    softness: 0.2,
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
    scale: 4,
    density: 0.8,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0,
    strokeCap: 0,
    noiseFrequency: 0,
    noisePower: 0,
    softness: 0.5,
    speed: 1,
    frame: 0,
  },
};

export const hookPreset: SpiralPreset = {
  name: 'Hook',
  params: {
    ...defaultPatternSizing,
    colorBack: '#85c2e0',
    colorFront: '#000000',
    scale: 0.8,
    density: 0,
    distortion: 0,
    strokeWidth: 0.5,
    strokeTaper: 0.5,
    strokeCap: 0,
    noiseFrequency: 0,
    noisePower: 0,
    softness: 0.02,
    speed: 3,
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
    distortion: 0.3,
    strokeWidth: 0.95,
    strokeTaper: 0,
    strokeCap: 1,
    noiseFrequency: 0,
    noisePower: 0,
    softness: 0.11,
    speed: 1,
    frame: 0,
  },
};

export const spiralPresets: SpiralPreset[] = [
  defaultPreset,
  noisyPreset,
  dropletPreset,
  swirlPreset,
  sandPreset,
  hookPreset,
  vinylPreset,
];

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
  noisePower = defaultPreset.params.noisePower,
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
    u_noisePower: noisePower,
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
