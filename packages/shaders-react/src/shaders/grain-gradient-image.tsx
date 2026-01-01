import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  getShaderColorFromString,
  getShaderNoiseTexture,
  grainGradientImageFragmentShader,
  ShaderFitOptions,
  type GrainGradientImageUniforms,
  type GrainGradientImageParams,
  type ImageShaderPreset,
  defaultObjectSizing,
  GrainGradientImageShapes,
} from '@paper-design/shaders';

export interface GrainGradientImageProps extends ShaderComponentProps, GrainGradientImageParams {}

type GrainGradientImagePreset = ImageShaderPreset<GrainGradientImageParams>;

export const defaultPreset: GrainGradientImagePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#7300ff', '#eba8ff', '#00bfff', '#2a00ff'],
    softness: 0.5,
    intensity: 0.5,
    noise: 0.25,
    shape: 'corners',
    blend: 0.5,
  },
};

export const wavePreset: GrainGradientImagePreset = {
  name: 'Wave',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 1,
    frame: 0,
    colorBack: '#000a0f',
    colors: ['#c4730b', '#bdad5f', '#d8ccc7'],
    softness: 0.7,
    intensity: 0.15,
    noise: 0.5,
    shape: 'wave',
    blend: 0.6,
  },
};

export const overlayPreset: GrainGradientImagePreset = {
  name: 'Overlay',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0.5,
    frame: 0,
    colorBack: '#00000000',
    colors: ['#ff006680', '#00ff6680', '#0066ff80'],
    softness: 0.8,
    intensity: 0.3,
    noise: 0.15,
    shape: 'blob',
    blend: 0.3,
  },
};

export const subtlePreset: GrainGradientImagePreset = {
  name: 'Subtle',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0.3,
    frame: 0,
    colorBack: '#00000000',
    colors: ['#ffffff40', '#00000040'],
    softness: 1,
    intensity: 0.1,
    noise: 0.1,
    shape: 'ripple',
    blend: 0.2,
  },
};

export const grainGradientImagePresets: GrainGradientImagePreset[] = [
  defaultPreset,
  wavePreset,
  overlayPreset,
  subtlePreset,
];

export const GrainGradientImage: React.FC<GrainGradientImageProps> = memo(function GrainGradientImageImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  softness = defaultPreset.params.softness,
  intensity = defaultPreset.params.intensity,
  noise = defaultPreset.params.noise,
  shape = defaultPreset.params.shape,
  blend = defaultPreset.params.blend,
  image = '',

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
}: GrainGradientImageProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_softness: softness,
    u_intensity: intensity,
    u_noise: noise,
    u_shape: GrainGradientImageShapes[shape],
    u_blend: blend,
    u_noiseTexture: getShaderNoiseTexture(),

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
  } satisfies GrainGradientImageUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={grainGradientImageFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
