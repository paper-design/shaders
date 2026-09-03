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
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    blending: 1,
    distortion: 0.75,
    clip: false,
    angle: 300,
    seed: 234,
    roughness: 0.4,
    roughnessSize: 0.25,
    roughnessRows: 0,
    fiber: 0.4,
    fiberSize: 0.5,
    folds: 0,
    foldSizeX: 0.6,
    foldSizeY: 0.44,
    foldOffsetX: 0,
    foldOffsetY: 0,
    wrinkles: 1,
    wrinkleSize: 0.65,
    crumples: 0,
    crumpleCount: 6,
    drops: 1,
    colorBack: '#d3d2ab',
    colorPaper: '#ffffffb5',
    colorShadow: '#b3b3b3',
  },
};

export const creasedPreset: PaperTexturePreset = {
  name: 'Creased',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    blending: 1,
    distortion: -0.5,
    clip: false,
    angle: 236,
    seed: 185,
    roughness: 0.4,
    roughnessSize: 0.25,
    roughnessRows: 0,
    fiber: 0.4,
    fiberSize: 0.5,
    folds: 0,
    foldSizeX: 0.6,
    foldSizeY: 0.89,
    foldOffsetX: 0.59,
    foldOffsetY: 1,
    wrinkles: 0,
    wrinkleSize: 0.65,
    crumples: 1,
    crumpleCount: 7,
    drops: 0,
    colorBack: '#d3d2ab',
    colorPaper: '#ffffff',
    colorShadow: '#b3b3b3',
  },
};

export const spreadPreset: PaperTexturePreset = {
  name: 'Spread',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    blending: 1,
    distortion: -0.3,
    clip: true,
    angle: 236,
    seed: 613,
    roughness: 0.15,
    roughnessSize: 0.25,
    roughnessRows: 0,
    fiber: 0.5,
    fiberSize: 0.5,
    folds: 1,
    foldSizeX: 0.4,
    foldSizeY: 0.89,
    foldOffsetX: 0,
    foldOffsetY: 0,
    wrinkles: 0,
    wrinkleSize: 0.65,
    crumples: 0,
    crumpleCount: 9,
    drops: 0,
    colorBack: '#ffffff00',
    colorPaper: '#ffffffb5',
    colorShadow: '#b3b3b3',
  },
};

export const flatPreset: PaperTexturePreset = {
  name: 'Flat',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    blending: 1,
    distortion: 0,
    clip: false,
    angle: 0,
    seed: 455,
    roughness: 1,
    roughnessSize: 0.5,
    roughnessRows: 0.6,
    fiber: 0.7,
    fiberSize: 1,
    folds: 0,
    foldSizeX: 0,
    foldSizeY: 0.44,
    foldOffsetX: 0,
    foldOffsetY: 0,
    wrinkles: 0,
    wrinkleSize: 0,
    crumples: 0,
    crumpleCount: 6,
    drops: 0.2,
    colorBack: '#d4cdab',
    colorPaper: '#ffffffa8',
    colorShadow: '#b3b3b3',
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
  image = '',
  blending = defaultPreset.params.blending,
  distortion = defaultPreset.params.distortion,
  clip = defaultPreset.params.clip,
  angle = defaultPreset.params.angle,
  seed = defaultPreset.params.seed,
  roughness = defaultPreset.params.roughness,
  roughnessSize = defaultPreset.params.roughnessSize,
  roughnessRows = defaultPreset.params.roughnessRows,
  fiber = defaultPreset.params.fiber,
  fiberScale,
  fiberSize = fiberScale === undefined ? defaultPreset.params.fiberSize : 0.2 / fiberScale,
  folds = defaultPreset.params.folds,
  foldSizeX = defaultPreset.params.foldSizeX,
  foldSizeY = defaultPreset.params.foldSizeY,
  foldOffsetX = defaultPreset.params.foldOffsetX,
  foldOffsetY = defaultPreset.params.foldOffsetY,
  wrinkles = defaultPreset.params.wrinkles,
  wrinkleSize = defaultPreset.params.wrinkleSize,
  crumples = defaultPreset.params.crumples,
  foldsNumber,
  crumpleCount = foldsNumber === undefined ? defaultPreset.params.crumpleCount : foldsNumber,
  drops = defaultPreset.params.drops,
  colorBack = defaultPreset.params.colorBack,
  colorPaper = defaultPreset.params.colorPaper,
  colorShadow = defaultPreset.params.colorShadow,

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
    u_blending: blending,
    u_distortion: distortion,
    u_clip: clip,
    u_angle: angle,
    u_seed: seed,
    u_roughness: roughness,
    u_roughnessSize: roughnessSize,
    u_roughnessRows: roughnessRows,
    u_fiber: fiber,
    u_fiberSize: fiberSize,
    u_folds: folds,
    u_foldSizeX: foldSizeX,
    u_foldSizeY: foldSizeY,
    u_foldOffsetX: foldOffsetX,
    u_foldOffsetY: foldOffsetY,
    u_wrinkles: wrinkles,
    u_wrinkleSize: wrinkleSize,
    u_crumples: crumples,
    u_crumpleCount: crumpleCount,
    u_drops: drops,
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorPaper: getShaderColorFromString(colorPaper),
    u_colorShadow: getShaderColorFromString(colorShadow),
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
