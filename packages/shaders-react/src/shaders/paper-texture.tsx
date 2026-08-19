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
  /** @deprecated use `foldCount` instead */
  foldsNumber?: number;
}

type PaperTexturePreset = ImageShaderPreset<PaperTextureParams>;

export const defaultPreset: PaperTexturePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: 0.5,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorShadow: '#b3b3b3',
    colorBack: '#ffffff',
    roughness: 0,
    roughnessSize: 0.25,
    fiber: 0.65,
    fiberSize: 0.5,
    folds: 0.5,
    foldCount: 12,
    creases: 0,
    creaseSizeX: 0.6,
    creaseSizeY: 0.89,
    creaseOffsetX: 0,
    creaseOffsetY: 0,
    lightAngle: 45,
    drops: 0.25,
    seed: 613,
    background: true,
  },
};

export const gridPreset: PaperTexturePreset = {
  name: 'Grid',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: 0.5,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorShadow: '#605b52',
    colorBack: '#ffffff',
    roughness: 0.16,
    roughnessSize: 0.25,
    fiber: 0.32,
    fiberSize: 0.5,
    folds: 0,
    foldCount: 12,
    creases: 0.25,
    creaseSizeX: 0.6,
    creaseSizeY: 0.89,
    creaseOffsetX: 0.59,
    creaseOffsetY: 1,
    lightAngle: 140,
    drops: 0,
    seed: 613,
    background: true,
  },
};

export const spreadPreset: PaperTexturePreset = {
  name: 'Spread',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: 0.38,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorShadow: '#c2c2c2',
    colorBack: '#ffffff',
    roughness: 0.16,
    roughnessSize: 0.25,
    fiber: 0.62,
    fiberSize: 0.58,
    folds: 0.25,
    foldCount: 12,
    creases: 0.55,
    creaseSizeX: 0,
    creaseSizeY: 0.89,
    creaseOffsetX: 0,
    creaseOffsetY: 0,
    lightAngle: 88,
    drops: 0,
    seed: 563,
    background: false,
  },
};

export const coloredPreset: PaperTexturePreset = {
  name: 'Colored',
  params: {
    ...defaultObjectSizing,
    blending: 1,
    distortion: 0.5,
    fit: 'contain',
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorShadow: '#ffcccc',
    colorBack: '#3b2942',
    roughness: 0.25,
    roughnessSize: 0.08,
    fiber: 0.52,
    fiberSize: 1,
    folds: 0,
    foldCount: 12,
    creases: 0.43,
    creaseSizeX: 1,
    creaseSizeY: 0.89,
    creaseOffsetX: 0.62,
    creaseOffsetY: 0,
    lightAngle: 316,
    drops: 1,
    seed: 476,
    background: true,
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
  colorShadow = defaultPreset.params.colorShadow,
  colorBack = defaultPreset.params.colorBack,
  image = '',
  roughness = defaultPreset.params.roughness,
  roughnessSize = defaultPreset.params.roughnessSize,
  fiber = defaultPreset.params.fiber,
  folds = defaultPreset.params.folds,
  creases = defaultPreset.params.creases,
  creaseSizeX = defaultPreset.params.creaseSizeX,
  creaseSizeY = defaultPreset.params.creaseSizeY,
  creaseOffsetX = defaultPreset.params.creaseOffsetX,
  creaseOffsetY = defaultPreset.params.creaseOffsetY,
  lightAngle = defaultPreset.params.lightAngle,
  drops = defaultPreset.params.drops,
  seed = defaultPreset.params.seed,
  blending = defaultPreset.params.blending,
  distortion = defaultPreset.params.distortion,
  background = defaultPreset.params.background,

  // Reworked props
  fiberScale,
  fiberSize = fiberScale === undefined ? defaultPreset.params.fiberSize : 0.2 / fiberScale,
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

  const lightRadians = (lightAngle * Math.PI) / 180;

  const uniforms = {
    // Own uniforms
    u_image: image,
    u_isImage: Boolean(image),
    u_colorShadow: getShaderColorFromString(colorShadow),
    u_colorBack: getShaderColorFromString(colorBack),
    u_roughness: roughness,
    u_roughnessSize: roughnessSize,
    u_fiber: fiber,
    u_fiberSize: fiberSize,
    u_foldCount: foldCount,
    u_creaseSizeX: creaseSizeX,
    u_creaseSizeY: creaseSizeY,
    u_creaseOffsetX: creaseOffsetX,
    u_creaseOffsetY: creaseOffsetY,
    u_lightDir: [Math.sin(lightRadians), -Math.cos(lightRadians)],
    u_foldTrig: [Math.cos(4 * seed), Math.sin(4 * seed)],
    u_folds: folds,
    u_creases: creases,
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
