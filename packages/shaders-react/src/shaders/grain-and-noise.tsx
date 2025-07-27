import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  grainAndNoiseFragmentShader,
  ShaderFitOptions,
  type GrainAndNoiseParams,
  type GrainAndNoiseUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface GrainAndNoiseProps extends ShaderComponentProps, GrainAndNoiseParams {}

type GrainAndNoisePreset = ShaderPreset<GrainAndNoiseParams>;

export const defaultPreset: GrainAndNoisePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    scale: 0.8,
    colorFront: '#add3ff',
    colorBack: '#ffffff',
    contrast: 0.4,
    grain: 1,
    curles: 0.,
    curlesScale: 0.4,
    channelR: 0.,
    channelB: 0.5,
    channelG: 1,
    folds: 0.,
    foldsNumber: 15,
    foldsSeed: 1,
    blur: 0.5,
    blurSeed: 0.5,
    drops: 0.5,
    dropsSeed: 1.6,
  },
};

export const grainAndNoisePresets: GrainAndNoisePreset[] = [
  defaultPreset
] as const;

export const GrainAndNoise: React.FC<GrainAndNoiseProps> = memo(function GrainAndNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  channelG = defaultPreset.params.channelG,
  foldsSeed = defaultPreset.params.foldsSeed,
  contrast = defaultPreset.params.contrast,
  grain = defaultPreset.params.grain,
  curles = defaultPreset.params.curles,
  curlesScale = defaultPreset.params.curlesScale,
  channelR = defaultPreset.params.channelR,
  channelB = defaultPreset.params.channelB,
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
}: GrainAndNoiseProps) {
  const noiseTexture = typeof window !== 'undefined' && { u_noiseTexture: getShaderNoiseTexture() };

  const uniforms = {
    // Own uniforms
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_foldsSeed: foldsSeed,
    u_contrast: contrast,
    u_grain: grain,
    u_curles: curles,
    u_curlesScale: curlesScale,
    u_channelR: channelR,
    u_channelG: channelG,
    u_channelB: channelB,
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
  } satisfies GrainAndNoiseUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={grainAndNoiseFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
