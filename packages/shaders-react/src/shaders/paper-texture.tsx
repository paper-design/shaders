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
    colorPaper: '#ffffffb5',
    colorShadow: '#b3b3b3',
    roughness: 0.4,
    roughnessSize: 0.25,
    fiber: 0.4,
    fiberSize: 0.5,
    crumples: 0,
    crumpleCount: 6,
    wrinkles: 1,
    wrinkleSize: 0.65,
    folds: 0,
    foldSizeX: 0.6,
    foldSizeY: 0.44,
    foldOffsetX: 0,
    foldOffsetY: 0,
    angle: 300,
    drops: 1,
    seed: 234,
    clip: false,
  },
};

export const creasedPreset: PaperTexturePreset = {
  name: 'Creased',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: -0.5,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorBack: '#d3d2ab',
    colorPaper: '#ffffff',
    colorShadow: '#bcc3cd',
    roughness: 0.4,
    roughnessSize: 0.25,
    fiber: 0.4,
    fiberSize: 0.5,
    crumples: 1,
    crumpleCount: 7,
    wrinkles: 0,
    wrinkleSize: 0.65,
    folds: 0,
    foldSizeX: 0.6,
    foldSizeY: 0.89,
    foldOffsetX: 0.59,
    foldOffsetY: 1,
    angle: 236,
    drops: 0,
    seed: 13,
    clip: false,
  },
};

export const spreadPreset: PaperTexturePreset = {
  name: 'Spread',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: -0.5,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorBack: '#ffffff00',
    colorPaper: '#ffffffb5',
    colorShadow: '#b3b3b3',
    roughness: 0.15,
    roughnessSize: 0.25,
    fiber: 0.4,
    fiberSize: 0.5,
    crumples: 0,
    crumpleCount: 9,
    wrinkles: 0,
    wrinkleSize: 0.65,
    folds: 1,
    foldSizeX: 0.1,
    foldSizeY: 0.89,
    foldOffsetX: 0,
    foldOffsetY: 0,
    angle: 236,
    drops: 0,
    seed: 563,
    clip: true,
  },
};

export const flatPreset: PaperTexturePreset = {
  name: 'Flat',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: 0,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorBack: '#d4cdab',
    colorPaper: '#ffffffa8',
    colorShadow: '#b3b3b3',
    roughness: 1,
    roughnessSize: 0.5,
    fiber: 0.57,
    fiberSize: 1,
    crumples: 0,
    crumpleCount: 6,
    wrinkles: 0,
    wrinkleSize: 0,
    folds: 0,
    foldSizeX: 0,
    foldSizeY: 0.44,
    foldOffsetX: 0,
    foldOffsetY: 0,
    angle: 300,
    drops: 0.56,
    seed: 455,
    clip: false,
  },
};

export const paperTexturePresets: PaperTexturePreset[] = [
  defaultPreset,
  spreadPreset,
  creasedPreset,
  flatPreset,
] as const;

export const PaperTexture: React.FC<PaperTextureProps> = memo(function PaperTextureImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorPaper = defaultPreset.params.colorPaper,
  colorShadow = defaultPreset.params.colorShadow,
  image = '',
  roughness = defaultPreset.params.roughness,
  roughnessSize = defaultPreset.params.roughnessSize,
  fiber = defaultPreset.params.fiber,
  crumples = defaultPreset.params.crumples,
  wrinkles = defaultPreset.params.wrinkles,
  wrinkleSize = defaultPreset.params.wrinkleSize,
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
    u_colorPaper: getShaderColorFromString(colorPaper),
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
    u_wrinkles: wrinkles,
    u_wrinkleSize: wrinkleSize,
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
