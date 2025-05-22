import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import {
  getShaderColorFromString,
  grainGradientFragmentShader,
  ShaderFitOptions,
  type GrainGradientUniforms,
  type GrainGradientParams,
  type ShaderPreset,
  defaultPatternSizing,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface GrainGradientProps extends ShaderComponentProps, GrainGradientParams {}

type GrainGradientPreset = ShaderPreset<GrainGradientParams>;

export const defaultPreset: GrainGradientPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000a0f',
    colors: ['#c4730b', '#bdad5f', '#d8ccc7'],
    softness: 0.7,
    intensity: 0.15,
    noise: 0.5,
    shape: 1,
  },
};

export const dotsPreset: GrainGradientPreset = {
  name: 'Dots',
  params: {
    ...defaultPatternSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#0a0000',
    colors: ['#6f0000', '#0080ff', '#f2ebc9'],
    softness: 0.75,
    intensity: 0.15,
    noise: 0.7,
    shape: 2,
  },
};

export const truchetPreset: GrainGradientPreset = {
  name: 'Truchet',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: '#0a0000',
    colors: ['#6f2200', '#eabb7c', '#39b523'],
    softness: 0,
    intensity: 0.2,
    noise: 1,
    shape: 3,
  },
};

export const cornersPreset: GrainGradientPreset = {
  name: 'Corners',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#031018',
    colors: ['#00aeff', '#00ffcc', '#ffc800'],
    // softness: 0.4,
    // intensity: 0.35,
    // noise: 0.35,
    softness: 0,
    intensity: 0,
    noise: 0,
    shape: 4,
  },
};

export const ripplePreset: GrainGradientPreset = {
  name: 'Ripple',
  params: {
    ...defaultObjectSizing,
    scale: 0.5,
    speed: 1,
    frame: 0,
    colorBack: '#140a00',
    colors: ['#6f2d00', '#88ddae', '#2c0b1d'],
    softness: 0.5,
    intensity: 0.5,
    noise: 0.5,
    shape: 5,
  },
};

export const blobPreset: GrainGradientPreset = {
  name: 'Blob',
  params: {
    ...defaultObjectSizing,
    scale: 1.3,
    speed: 1,
    frame: 0,
    colorBack: '#0f0e18',
    colors: ['#3e6172', '#a49b74', '#568c50'],
    softness: 0,
    intensity: 0.15,
    noise: 0.5,
    shape: 6,
  },
};

export const spherePreset: GrainGradientPreset = {
  name: 'Sphere',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000319',
    colors: ['#0059b3', '#37f5f5', '#18c039'],
    softness: 1,
    intensity: 0.15,
    noise: 0.5,
    shape: 7,
  },
};

export const moonPreset: GrainGradientPreset = {
  name: 'Moon',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#000000', '#28272d', '#ffeccc'],
    softness: 1,
    intensity: 0.56,
    noise: 1,
    shape: 7,
  },
};

export const grainGradientPresets: GrainGradientPreset[] = [
  cornersPreset,
  defaultPreset,
  dotsPreset,
  truchetPreset,
  ripplePreset,
  blobPreset,
  spherePreset,
  moonPreset,
];

export const GrainGradient: React.FC<GrainGradientProps> = memo(function GrainGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  softness = defaultPreset.params.softness,
  intensity = defaultPreset.params.intensity,
  noise = defaultPreset.params.noise,
  shape = defaultPreset.params.shape,

  // Sizing props
  fit = defaultPreset.params.fit,
  scale = defaultPreset.params.scale,
  rotation = defaultPreset.params.rotation,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_softness: softness,
    u_intensity: intensity,
    u_noise: noise,
    u_shape: shape,

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
  } satisfies GrainGradientUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={grainGradientFragmentShader}
      uniforms={uniforms}
    />
  );
});
