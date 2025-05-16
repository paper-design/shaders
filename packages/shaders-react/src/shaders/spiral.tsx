import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
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

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highmidIntensity bug)

export const defaultPreset: SpiralPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    color1: 'hsla(0, 0%, 98%, 1)',
    color2: 'hsla(0, 0%, 50%, 1)',
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
    color1: 'hsla(87, 77%, 53%, 1)',
    color2: 'hsla(109, 70%, 31%, 1)',
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
    color1: 'hsla(320, 50%, 50%, 1)',
    color2: 'hsla(190, 50%, 95%, 1)',
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
    color1: 'hsla(45, 25%, 50%, 1)',
    color2: 'hsla(0, 0%, 87%, 1)',
    scale: 3,
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
    color1: 'hsla(160, 50%, 80%, 1)',
    color2: 'hsla(220, 50%, 20%, 1)',
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
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(200, 50%, 70%, 1)',
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
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(320, 5%, 75%, 1)',
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
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  density = defaultPreset.params.density,
  distortion = defaultPreset.params.distortion,
  strokeWidth = defaultPreset.params.strokeWidth,
  strokeTaper = defaultPreset.params.strokeTaper,
  strokeCap = defaultPreset.params.strokeCap,
  noiseFrequency = defaultPreset.params.noiseFreq,
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
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
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
