import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultPatternSizing,
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
    ...defaultPatternSizing,
    speed: 0,
    frame: 0,
    colorFront: '#5e80ba',
    colorBack: '#ffffff',
    contrast: 0.3,
    grain: 0.55,
    curles: 0.4,
    curlesScale: 0.1,
    crumples: 0.7,
    crumplesScale: 0.5,
    crumplesSeed: 1,
    folds: 0.65,
    foldsScale: 0.5,
    foldsSeed: 1,
    blur: 0.75,
    blurSeed: 0.5,
  },
};

export const abstractPreset: PaperTexturePreset = {
  name: 'Abstract',
  params: {
    ...defaultPatternSizing,
    speed: 0,
    frame: 0,
    colorFront: '#ff8f8f',
    colorBack: '#3a53f8',
    contrast: 0.75,
    grain: 1,
    curles: 0.6,
    curlesScale: 0.2,
    crumples: 0.6,
    crumplesScale: 0.5,
    crumplesSeed: 1,
    folds: 0.9,
    foldsScale: 0.25,
    foldsSeed: 181,
    blur: 0.5,
    blurSeed: 0.5,
  },
};

export const cardboardPreset: PaperTexturePreset = {
  name: 'Cardboard',
  params: {
    ...defaultPatternSizing,
    speed: 0,
    frame: 0,
    colorFront: '#834b02',
    colorBack: '#3d2300',
    contrast: 0.5,
    grain: 1,
    curles: 0.6,
    curlesScale: 0.85,
    crumples: 0.5,
    crumplesScale: 1.75,
    crumplesSeed: 1,
    folds: 0,
    foldsScale: 0.25,
    foldsSeed: 181,
    blur: 0.5,
    blurSeed: 0.5,
  },
};

export const paperTexturePresets: PaperTexturePreset[] = [defaultPreset, cardboardPreset, abstractPreset] as const;

export const PaperTexture: React.FC<PaperTextureProps> = memo(function PaperTextureImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  crumplesSeed = defaultPreset.params.crumplesSeed,
  foldsSeed = defaultPreset.params.foldsSeed,
  contrast = defaultPreset.params.contrast,
  grain = defaultPreset.params.grain,
  curles = defaultPreset.params.curles,
  curlesScale = defaultPreset.params.curlesScale,
  crumples = defaultPreset.params.crumples,
  foldsScale = defaultPreset.params.foldsScale,
  folds = defaultPreset.params.folds,
  blur = defaultPreset.params.blur,
  blurSeed = defaultPreset.params.blurSeed,
  crumplesScale = defaultPreset.params.crumplesScale,

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
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_crumplesSeed: crumplesSeed,
    u_foldsSeed: foldsSeed,
    u_contrast: contrast,
    u_grain: grain,
    u_curles: curles,
    u_curlesScale: curlesScale,
    u_crumples: crumples,
    u_foldsScale: foldsScale,
    u_folds: folds,
    u_blur: blur,
    u_blurSeed: blurSeed,
    u_crumplesScale: crumplesScale,
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
