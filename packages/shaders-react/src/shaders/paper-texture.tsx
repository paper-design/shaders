import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  paperTextureFragmentShader,
  PaperTextureFoldTypes,
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
    blending: 0.8,
    distortion: 0.5,
    fit: 'contain',
    scale: 0.8,
    speed: 0,
    frame: 0,
    colorFront: '#c4c4c4',
    colorBack: '#ffffff',
    roughness: 0,
    roughnessSize: 0.25,
    fiber: 0.5,
    fiberSize: 0.5,
    crumples: 0,
    crumpleSize: 0.5,
    folds: 0.7,
    foldType: 'folds',
    foldCount: 15,
    foldSize: 0.79,
    foldY: false,
    foldOffset: 0,
    foldsShape: 1,
    fade: 0,
    drops: 0,
    seed: 354,
    background: true,
  },
};

export const cardboardPreset: PaperTexturePreset = {
  name: 'Cardboard',
  params: {
    ...defaultObjectSizing,
    blending: 0.9,
    distortion: 0.5,
    fit: 'contain',
    speed: 1,
    frame: 0,
    scale: 0.8,
    colorBack: "#dcc593",
    colorFront: "#685327",
    roughness: 0.1,
    roughnessSize: 0.25,
    fiber: 0.35,
    fiberSize: 0.14,
    crumples: 0.,
    crumpleSize: 0.1,
    folds: 0.25,
    foldType: 'creases',
    foldCount: 18,
    foldSize: 0.1,
    foldY: false,
    foldOffset: 0,
    foldsShape: 0.28,
    fade: 0,
    drops: 0.1,
    seed: 1.6,
    background: true,
  },
};

export const spreadPreset: PaperTexturePreset = {
  name: 'Spread',
  params: {
    ...defaultObjectSizing,
    colorBack: "#ffffff",
    colorFront: "#c4c4c4",
    blending: 1,
    distortion: 0.7,
    seed: 448,
    roughness: 0.2,
    roughnessSize: 0.25,
    fiber: 0,
    fiberSize: 0.5,
    crumples: 0,
    crumpleSize: 0.42,
    folds: 0.7,
    foldType: 'creases',
    foldCount: 1,
    foldSize: 1,
    foldY: true,
    foldOffset: 0,
    foldsShape: 1,
    drops: 0,
    fade: 0.68,
    scale: 0.95,
    fit: "contain",
    speed: 1,
    frame: 0,
    background: false,
  },
};


export const sheetPreset: PaperTexturePreset = {
  name: 'Sheet',
  params: {
    ...defaultObjectSizing,
    blending: 0.8,
    distortion: 0.5,
    fit: 'contain',
    scale: 0.8,
    speed: 0,
    frame: 0,
    colorFront: '#c4c4c4',
    colorBack: '#ffffff',
    roughness: 0,
    roughnessSize: 0.25,
    fiber: 0.5,
    fiberSize: 0.5,
    crumples: 0,
    crumpleSize: 0.5,
    folds: 1,
    foldType: 'folds',
    foldCount: 10,
    foldSize: 0.79,
    foldY: false,
    foldOffset: 0,
    foldsShape: 1,
    fade: 1,
    drops: 1,
    seed: 784,
    background: false,
  },
};

export const paperTexturePresets: PaperTexturePreset[] = [
  defaultPreset,
  spreadPreset,
  cardboardPreset,
  sheetPreset
] as const;

export const PaperTexture: React.FC<PaperTextureProps> = memo(function PaperTextureImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  image = '',
  roughness = defaultPreset.params.roughness,
  roughnessSize = defaultPreset.params.roughnessSize,
  fiber = defaultPreset.params.fiber,
  crumples = defaultPreset.params.crumples,
  folds = defaultPreset.params.folds,
  foldType = defaultPreset.params.foldType,
  foldSize = defaultPreset.params.foldSize,
  foldY = defaultPreset.params.foldY,
  foldOffset = defaultPreset.params.foldOffset,
  foldsShape = defaultPreset.params.foldsShape,
  drops = defaultPreset.params.drops,
  seed = defaultPreset.params.seed,
  blending = defaultPreset.params.blending,
  distortion = defaultPreset.params.distortion,
  background = defaultPreset.params.background,

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
    u_roughness: roughness,
    u_roughnessSize: roughnessSize,
    u_fiber: fiber,
    u_fiberSize: fiberSize,
    u_crumples: crumples,
    u_crumpleSize: crumpleSize,
    u_foldCount: foldCount,
    u_foldSize: foldSize,
    u_foldY: foldY,
    u_foldOffset: foldOffset,
    u_folds: folds,
    u_foldType: PaperTextureFoldTypes[foldType],
    u_foldsShape: foldsShape,
    u_fade: fade,
    u_drops: drops,
    u_seed: seed,
    u_blending: blending,
    u_distortion: distortion,
    u_background: background,
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
