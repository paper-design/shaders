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
  /** @deprecated use `crumpleCount` instead */
  foldsNumber?: number;
}

type PaperTexturePreset = ImageShaderPreset<PaperTextureParams>;

export const defaultPreset: PaperTexturePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: 0.75,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorBack: '#d3d2ab',
    colorBase: '#ffffffb5',
    colorShadow: '#b3b3b3',
    roughness: 0,
    roughnessSize: 0.25,
    fiber: 0.65,
    fiberSize: 0.5,
    crumples: 0.5,
    crumpleCount: 6,
    folds: 0,
    foldSizeX: 0.6,
    foldSizeY: 0.89,
    foldOffsetX: 0,
    foldOffsetY: 0,
    angle: 300,
    drops: 0.7,
    seed: 234,
    clip: false,
  },
};

export const gridPreset: PaperTexturePreset = {
  name: 'Grid',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: -0.5,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    colorBase: '#ffffff',
    colorShadow: '#605b52',
    roughness: 0.16,
    roughnessSize: 0.25,
    fiber: 0.32,
    fiberSize: 0.5,
    crumples: 0,
    crumpleCount: 12,
    folds: 0.25,
    foldSizeX: 0.6,
    foldSizeY: 0.89,
    foldOffsetX: 0.59,
    foldOffsetY: 1,
    angle: 140,
    drops: 0,
    seed: 613,
    clip: false,
  },
};

export const spreadPreset: PaperTexturePreset = {
  name: 'Spread',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: -0.38,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorBack: '#d4d3ab00',
    colorBase: '#ffffff',
    colorShadow: '#c2c2c2',
    roughness: 0.16,
    roughnessSize: 0.25,
    fiber: 0.62,
    fiberSize: 0.58,
    crumples: 0.25,
    crumpleCount: 9,
    folds: 0.55,
    foldSizeX: 0,
    foldSizeY: 0.89,
    foldOffsetX: 0,
    foldOffsetY: 0,
    angle: 88,
    drops: 0,
    seed: 563,
    clip: true,
  },
};

export const coloredPreset: PaperTexturePreset = {
  name: 'Colored',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: -0.5,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorBack: '#d3d2ab',
    colorBase: '#f5b689',
    colorShadow: '#7654c9',
    roughness: 0,
    roughnessSize: 0.08,
    fiber: 0.52,
    fiberSize: 1,
    crumples: 0,
    crumpleCount: 12,
    folds: 0.43,
    foldSizeX: 1,
    foldSizeY: 0.89,
    foldOffsetX: 0.62,
    foldOffsetY: 0,
    angle: 316,
    drops: 1,
    seed: 476,
    clip: false,
  },
};

export const paperTexturePresets: PaperTexturePreset[] = [
  defaultPreset,
  spreadPreset,
  gridPreset,
  coloredPreset,
] as const;

export const PaperTexture: React.FC<PaperTextureProps> = memo(function PaperTextureImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorBase = defaultPreset.params.colorBase,
  colorShadow = defaultPreset.params.colorShadow,
  image = '',
  roughness = defaultPreset.params.roughness,
  roughnessSize = defaultPreset.params.roughnessSize,
  fiber = defaultPreset.params.fiber,
  crumples = defaultPreset.params.crumples,
  folds = defaultPreset.params.folds,
  foldSizeX = defaultPreset.params.foldSizeX,
  foldSizeY = defaultPreset.params.foldSizeY,
  foldOffsetX = defaultPreset.params.foldOffsetX,
  foldOffsetY = defaultPreset.params.foldOffsetY,
  angle = defaultPreset.params.angle,
  drops = defaultPreset.params.drops,
  seed = defaultPreset.params.seed,
  blending = defaultPreset.params.blending,
  distortion = defaultPreset.params.distortion,
  clip = defaultPreset.params.clip,

  // Reworked props
  fiberScale,
  fiberSize = fiberScale === undefined ? defaultPreset.params.fiberSize : 0.2 / fiberScale,
  foldsNumber,
  crumpleCount = foldsNumber === undefined ? defaultPreset.params.crumpleCount : foldsNumber,

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
    u_isImage: Boolean(image),
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorBase: getShaderColorFromString(colorBase),
    u_colorShadow: getShaderColorFromString(colorShadow),
    u_roughness: roughness,
    u_roughnessSize: roughnessSize,
    u_fiber: fiber,
    u_fiberSize: fiberSize,
    u_crumpleCount: crumpleCount,
    u_foldSizeX: foldSizeX,
    u_foldSizeY: foldSizeY,
    u_foldOffsetX: foldOffsetX,
    u_foldOffsetY: foldOffsetY,
    u_angle: angle,
    u_crumples: crumples,
    u_folds: folds,
    u_drops: drops,
    u_seed: seed,
    u_blending: blending,
    u_distortion: distortion,
    u_clip: clip,
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
