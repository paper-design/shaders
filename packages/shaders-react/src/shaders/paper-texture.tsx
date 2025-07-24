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
    speed: 0,
    frame: 0,
    scale: 0.8,
    colorFront: '#add3ff',
    colorBack: '#ffffff',
    image: '/images/010.png',
    contrast: 0.4,
    grain: 0.7,
    curles: 0.1,
    curlesScale: 0.4,
    crumples: 0.2,
    crumplesScale: 0.5,
    crumplesSeed: 1,
    folds: 0.65,
    foldsNumber: 15,
    foldsSeed: 1,
    blur: 0.5,
    blurSeed: 0.5,
    drops: 0.5,
    dropsSeed: 0,
  },
};

export const emptyPaperPreset: PaperTexturePreset = {
  name: 'Empty Paper',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    scale: 0.8,
    colorFront: '#b9bfc6',
    colorBack: '#ffffff',
    image: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
    contrast: 0.4,
    grain: 0.6,
    curles: 0.1,
    curlesScale: 0.4,
    crumples: 0.4,
    crumplesScale: 0.5,
    crumplesSeed: 1,
    folds: 0.65,
    foldsNumber: 15,
    foldsSeed: 1,
    blur: 0.5,
    blurSeed: 0.5,
    drops: 0.5,
    dropsSeed: 0,
  },
};

export const abstractPreset: PaperTexturePreset = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    scale: 0.8,
    colorFront: '#a2ff8f',
    colorBack: '#3a53f8',
    image: '/images/010.png',
    contrast: 0.3,
    grain: 0.8,
    curles: 0.6,
    curlesScale: 0.2,
    crumples: 0.6,
    crumplesScale: 0.5,
    crumplesSeed: 1,
    folds: 0.9,
    foldsNumber: 7,
    foldsSeed: 281,
    blur: 0.5,
    blurSeed: 0.5,
    drops: 0.5,
    dropsSeed: 0,
  },
};

export const cardboardPreset: PaperTexturePreset = {
  name: 'Cardboard',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    scale: 0.8,
    colorFront: '#a26b22',
    colorBack: '#77490e',
    image: '/images/010.png',
    contrast: 0.5,
    grain: 1,
    curles: 0.6,
    curlesScale: 0.85,
    crumples: 1,
    crumplesScale: 1.75,
    crumplesSeed: 1,
    folds: 0,
    foldsNumber: 3,
    foldsSeed: 181,
    blur: 0.5,
    blurSeed: 0.5,
    drops: 0.5,
    dropsSeed: 0,
  },
};

export const paperTexturePresets: PaperTexturePreset[] = [defaultPreset, emptyPaperPreset, cardboardPreset, abstractPreset] as const;

export const PaperTexture: React.FC<PaperTextureProps> = memo(function PaperTextureImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  image = defaultPreset.params.image,
  crumplesSeed = defaultPreset.params.crumplesSeed,
  foldsSeed = defaultPreset.params.foldsSeed,
  contrast = defaultPreset.params.contrast,
  grain = defaultPreset.params.grain,
  curles = defaultPreset.params.curles,
  curlesScale = defaultPreset.params.curlesScale,
  crumples = defaultPreset.params.crumples,
  crumplesScale = defaultPreset.params.crumplesScale,
  foldsNumber = defaultPreset.params.foldsNumber,
  folds = defaultPreset.params.folds,
  blur = defaultPreset.params.blur,
  blurSeed = defaultPreset.params.blurSeed,
  drops = defaultPreset.params.drops,
  dropsSeed = defaultPreset.params.dropsSeed,

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
    u_crumplesSeed: crumplesSeed,
    u_foldsSeed: foldsSeed,
    u_contrast: contrast,
    u_grain: grain,
    u_curles: curles,
    u_curlesScale: curlesScale,
    u_crumples: crumples,
    u_crumplesScale: crumplesScale,
    u_foldsNumber: foldsNumber,
    u_folds: folds,
    u_blur: blur,
    u_blurSeed: blurSeed,
    u_drops: drops,
    u_dropsSeed: dropsSeed,
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
