import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  paperTextureFragmentShader,
  ShaderFitOptions,
  type PaperTextureParams,
  type PaperTextureUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface PaperTextureProps extends ShaderComponentProps, PaperTextureParams {}

type PaperTexturePreset = ShaderPreset<PaperTextureParams>;

export const defaultPreset: PaperTexturePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    // fit: 'cover',
    scale: 0.8,
    speed: 0,
    frame: 0,
    colorFront: '#8da09d',
    colorBack: '#ffffff',
    image: '/images/image-filters/0024.webp',
    contrast: 0.3,
    roughness: 0.7,
    fiber: 0.1,
    fiberScale: 1,
    crumples: 0.3,
    crumplesScale: 0.5,
    folds: 0.65,
    foldsNumber: 12,
    blur: 0,
    drops: 0.2,
    seed: 3.5,
  },
};

export const abstractPreset: PaperTexturePreset = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    scale: 0.8,
    colorFront: '#ffe500',
    colorBack: '#ff00fb',
    image: '/images/image-filters/0024.webp',
    contrast: 0.85,
    roughness: 0,
    fiber: 0.1,
    fiberScale: 1,
    crumples: 0,
    crumplesScale: 1,
    folds: 1,
    foldsNumber: 2,
    blur: 0,
    drops: 0.2,
    seed: 6.1,
  },
};

export const cardboardPreset: PaperTexturePreset = {
  name: 'Cardboard',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    scale: 0.8,
    colorFront: '#c98e26',
    colorBack: '#5e4d2b',
    image: '/images/image-filters/0024.webp',
    contrast: 0.4,
    roughness: 0,
    fiber: 0.35,
    fiberScale: 2,
    crumples: 0.7,
    crumplesScale: 1.4,
    folds: 0,
    foldsNumber: 1,
    blur: 0,
    drops: 0.1,
    seed: 1.6,
  },
};

export const detailsPreset: PaperTexturePreset = {
  name: 'Details',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    fit: 'cover',
    scale: 3,
    colorFront: '#00000000',
    colorBack: '#ffffff',
    image: '/images/image-filters/0024.webp',
    contrast: 0,
    roughness: 1,
    fiber: 0.27,
    fiberScale: 2,
    crumples: 1,
    crumplesScale: 3,
    folds: 1,
    foldsNumber: 15,
    blur: 0,
    drops: 0,
    seed: 6,
  },
};

export const paperTexturePresets: PaperTexturePreset[] = [
  defaultPreset,
  cardboardPreset,
  abstractPreset,
  detailsPreset,
] as const;

export const PaperTexture: React.FC<PaperTextureProps> = memo(function PaperTextureImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  image = defaultPreset.params.image,
  contrast = defaultPreset.params.contrast,
  roughness = defaultPreset.params.roughness,
  fiber = defaultPreset.params.fiber,
  fiberScale = defaultPreset.params.fiberScale,
  crumples = defaultPreset.params.crumples,
  crumplesScale = defaultPreset.params.crumplesScale,
  foldsNumber = defaultPreset.params.foldsNumber,
  folds = defaultPreset.params.folds,
  blur = defaultPreset.params.blur,
  drops = defaultPreset.params.drops,
  seed = defaultPreset.params.seed,

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
}: PaperTextureProps) {
  const noiseTexture = typeof window !== 'undefined' && { u_noiseTexture: getShaderNoiseTexture() };

  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_contrast: contrast,
    u_roughness: roughness,
    u_fiber: fiber,
    u_fiberScale: fiberScale,
    u_crumples: crumples,
    u_crumplesScale: crumplesScale,
    u_foldsNumber: foldsNumber,
    u_folds: folds,
    u_blur: blur,
    u_drops: drops,
    u_seed: seed,
    ...noiseTexture,

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
  } satisfies PaperTextureUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={paperTextureFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
