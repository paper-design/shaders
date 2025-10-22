import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  getShaderColorFromString,
  simplexNoiseFragmentShader,
  ShaderFitOptions,
  type SimplexNoiseUniforms,
  type SimplexNoiseParams,
  type ShaderPreset,
  defaultPatternSizing,
} from '@paper-design/shaders';

export interface SimplexNoiseProps extends ShaderComponentProps, SimplexNoiseParams {}

type SimplexNoisePreset = ShaderPreset<SimplexNoiseParams>;

export const defaultPreset: SimplexNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    scale: 0.6,
    speed: 0.5,
    frame: 0,
    colors: ['#4449CF', '#FFD1E0', '#F94446', '#FFD36B', '#FFFFFF'],
    stepsPerColor: 2,
    softness: 0,
  },
};

export const bubblegumPreset: SimplexNoisePreset = {
  name: 'Bubblegum',
  params: {
    ...defaultPatternSizing,
    speed: 2,
    frame: 0,
    colors: ['#ffffff', '#ff9e9e', '#5f57ff', '#00f7ff'],
    stepsPerColor: 1,
    softness: 1.0,
    scale: 1.6,
  },
};

export const spotsPreset: SimplexNoisePreset = {
  name: 'Spots',
  params: {
    ...defaultPatternSizing,
    speed: 0.6,
    frame: 0,
    colors: ['#ff7b00', '#f9ffeb', '#320d82'],
    stepsPerColor: 1,
    softness: 0.0,
    scale: 1.0,
  },
};

export const firstContactPreset: SimplexNoisePreset = {
  name: 'First contact',
  params: {
    ...defaultPatternSizing,
    speed: 2,
    frame: 0,
    colors: ['#e8cce6', '#120d22', '#442c44', '#e6baba', '#fff5f5'],
    stepsPerColor: 2,
    softness: 0.0,
    scale: 0.2,
  },
};

export const simplexNoisePresets: SimplexNoisePreset[] = [
  defaultPreset,
  spotsPreset,
  firstContactPreset,
  bubblegumPreset,
];

export const SimplexNoise: React.FC<SimplexNoiseProps> = memo(function SimplexNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  stepsPerColor = defaultPreset.params.stepsPerColor,
  softness = defaultPreset.params.softness,

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
}: SimplexNoiseProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_stepsPerColor: stepsPerColor,
    u_softness: softness,

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
  } satisfies SimplexNoiseUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={simplexNoiseFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
