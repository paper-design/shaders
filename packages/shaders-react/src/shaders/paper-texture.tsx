import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  paperTextureFragmentShader,
  ShaderFitOptions,
  type ImageShaderPreset,
  type PaperTextureParams,
  type PaperTextureUniforms,
} from '@paper-design/shaders';

export interface PaperTextureProps extends ShaderComponentProps, PaperTextureParams {
  /** @deprecated use `fiberSize` instead */
  fiberScale?: number;
  /** @deprecated use `crumpleSize` instead */
  crumplesScale?: number;
  /** @deprecated use `foldCount` instead */
  foldsNumber?: number;
  /** @deprecated use `fade` instead */
  blur?: number;
}

type PaperTexturePreset = ImageShaderPreset<PaperTextureParams>;

export const defaultPreset: PaperTexturePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    blending: 0,
    distortion: 0.5,
    fit: 'contain',
    scale: 0.8,
    speed: 0,
    frame: 0,
    colorFront: '#9fadbc',
    colorBack: '#ffffff',
    contrast: 0.3,
    roughness: 0.4,
    roughnessSize: 0.5,
    fiber: 0.2,
    fiberSize: 0.5,
    crumples: 0.3,
    crumpleSize: 0.5,
    folds: 0.65,
    foldCount: 7,
    grid: 0,
    gridShape: 0.35,
    gridCount: 3,
    fade: 0,
    drops: 0.2,
    seed: 5.8,
  },
};

export const fiberPreset: PaperTexturePreset = {
  name: 'Fiber',
  params: {
    ...defaultObjectSizing,
    colorBack: "#eaffe0",
    colorFront: "#c19ac6",
    contrast: 0.05,
    blending: 0.8,
    distortion: 1.00,
    seed: 365,
    roughness: 0.63,
    roughnessSize: 0.50,
    fiber: 0.76,
    fiberSize: 0.61,
    crumples: 0,
    crumpleSize: 0.30,
    folds: 0,
    foldCount: 3,
    grid: 0,
    gridShape: 0.50,
    gridCount: 10,
    drops: 0.20,
    fade: 1,
    scale: 0.80,
    fit: "contain",
    speed: 0,
    frame: 0
  },
};

export const cardboardPreset: PaperTexturePreset = {
  name: 'Cardboard',
  params: {
    ...defaultObjectSizing,
    blending: 0.5,
    distortion: 0.5,
    fit: 'contain',
    speed: 0,
    frame: 0,
    scale: 0.8,
    colorBack: "#dcc593",
    colorFront: "#685327",
    contrast: 0.27,
    roughness: 0.1,
    roughnessSize: 0.50,
    fiber: 0.35,
    fiberSize: 0.14,
    crumples: 0.,
    crumpleSize: 0.1,
    folds: 0,
    foldCount: 1,
    grid: 0.25,
    gridShape: 0.28,
    gridCount: 20,
    fade: 0,
    drops: 0.1,
    seed: 1.6,
  },
};

export const spreadPreset: PaperTexturePreset = {
  name: 'Spread',
  params: {
    ...defaultObjectSizing,
    colorBack: "#ffffff",
    colorFront: "#c0c4c0",
    contrast: 0.47,
    blending: 0.36,
    distortion: 0.50,
    seed: 280,
    roughness: 0.4,
    roughnessSize: 0.4,
    fiber: 0.24,
    fiberSize: 0.5,
    crumples: 0.2,
    crumpleSize: 0.42,
    folds: 0.3,
    foldCount: 4,
    grid: 0.7,
    gridShape: 0.48,
    gridCount: 1,
    drops: 0,
    fade: 0.68,
    scale: 0.8,
    fit: "contain",
    speed: 0,
    frame: 0
  },
};


export const flatPreset: PaperTexturePreset = {
  name: 'Flat',
  params: {
    ...defaultObjectSizing,
    colorBack: '#fff3e0',
    colorFront: '#9c9c9c',
    contrast: 0.79,
    blending: 0.19,
    distortion: 0.33,
    seed: 415,
    roughness: 0.31,
    roughnessSize: 1.0,
    fiber: 0,
    fiberSize: 0.61,
    crumples: 0.7,
    crumpleSize: 0.2,
    folds: 0,
    foldCount: 6,
    grid: 0.0,
    gridShape: 0.30,
    gridCount: 20.0,
    drops: 0.20,
    fade: 0.75,
    scale: 0.8,
    fit: 'contain',
    speed: 0,
    frame: 0
  },
};

export const paperTexturePresets: PaperTexturePreset[] = [
  defaultPreset,
  spreadPreset,
  cardboardPreset,
  fiberPreset,
  flatPreset
] as const;

export const PaperTexture: React.FC<PaperTextureProps> = memo(function PaperTextureImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  image = '',
  contrast = defaultPreset.params.contrast,
  roughness = defaultPreset.params.roughness,
  roughnessSize = defaultPreset.params.roughnessSize,
  fiber = defaultPreset.params.fiber,
  crumples = defaultPreset.params.crumples,
  folds = defaultPreset.params.folds,
  grid = defaultPreset.params.grid,
  gridShape = defaultPreset.params.gridShape,
  gridCount = defaultPreset.params.gridCount,
  drops = defaultPreset.params.drops,
  seed = defaultPreset.params.seed,
  blending = defaultPreset.params.blending,
  distortion = defaultPreset.params.distortion,

  // Reworked props
  fiberScale,
  fiberSize = fiberScale === undefined ? defaultPreset.params.fiberSize : 0.2 / fiberScale,
  crumplesScale,
  crumpleSize = crumplesScale === undefined ? defaultPreset.params.crumpleSize : 0.2 / crumplesScale,
  blur,
  fade = blur === undefined ? defaultPreset.params.fade : blur,
  foldsNumber,
  foldCount = foldsNumber === undefined ? defaultPreset.params.foldCount : foldsNumber,

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
    u_roughnessSize: roughnessSize,
    u_fiber: fiber,
    u_fiberSize: fiberSize,
    u_crumples: crumples,
    u_crumpleSize: crumpleSize,
    u_foldCount: foldCount,
    u_folds: folds,
    u_grid: grid,
    u_gridShape: gridShape,
    u_gridCount: gridCount,
    u_fade: fade,
    u_drops: drops,
    u_seed: seed,
    u_blending: blending,
    u_distortion: distortion,
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
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
