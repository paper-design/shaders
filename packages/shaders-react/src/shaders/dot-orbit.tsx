import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  getShaderColorFromString,
  getShaderNoiseTexture,
  dotOrbitFragmentShader,
  ShaderFitOptions,
  type DotOrbitParams,
  type DotOrbitUniforms,
  type ShaderPreset,
  defaultPatternSizing,
} from '@paper-design/shaders';

export interface DotOrbitProps extends ShaderComponentProps, DotOrbitParams {}

type DotOrbitPreset = ShaderPreset<DotOrbitParams>;

export const defaultPreset: DotOrbitPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1.5,
    frame: 0,
    colorBack: '#000000',
    colors: ['#ffc96b', '#ff6200', '#ff2f00', '#421100', '#1a0000'],
    size: 1,
    sizeRange: 0,
    spreading: 1,
    stepsPerColor: 4,
  },
};

export const shinePreset: DotOrbitPreset = {
  name: 'Shine',
  params: {
    ...defaultPatternSizing,
    speed: 0.1,
    frame: 0,
    colors: ['#ffffff', '#006aff', '#fff675'],
    colorBack: '#000000',
    stepsPerColor: 4,
    size: 0.3,
    sizeRange: 0.2,
    spreading: 1,
    scale: 0.4,
  },
};

export const bubblesPreset: DotOrbitPreset = {
  name: 'Bubbles',
  params: {
    ...defaultPatternSizing,
    speed: 0.4,
    frame: 0,
    colors: ['#D0D2D5'],
    colorBack: '#989CA4',
    stepsPerColor: 2,
    size: 0.9,
    sizeRange: 0.7,
    spreading: 1.0,
    scale: 1.64,
  },
};

export const hallucinatoryPreset: DotOrbitPreset = {
  name: 'Hallucinatory',
  params: {
    ...defaultPatternSizing,
    speed: 5,
    frame: 0,
    colors: ['#000000'],
    colorBack: '#ffe500',
    stepsPerColor: 2,
    size: 0.65,
    sizeRange: 0,
    spreading: 0.3,
    scale: 0.5,
  },
};

export const dotOrbitPresets: DotOrbitPreset[] = [defaultPreset, bubblesPreset, shinePreset, hallucinatoryPreset];

export const DotOrbit: React.FC<DotOrbitProps> = memo(function DotOrbitImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  size = defaultPreset.params.size,
  sizeRange = defaultPreset.params.sizeRange,
  spreading = defaultPreset.params.spreading,
  stepsPerColor = defaultPreset.params.stepsPerColor,

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
}: DotOrbitProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_size: size,
    u_sizeRange: sizeRange,
    u_spreading: spreading,
    u_stepsPerColor: stepsPerColor,
    u_noiseTexture: getShaderNoiseTexture(),

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
  } satisfies DotOrbitUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={dotOrbitFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
