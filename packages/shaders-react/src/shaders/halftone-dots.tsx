import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  halftoneDotsFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  type HalftoneDotsUniforms,
  type HalftoneDotsParams,
  defaultObjectSizing,
  type ImageShaderPreset,
  HalftoneDotsTypes,
  HalftoneDotsGrids,
} from '@paper-design/shaders';

export interface HalftoneDotsProps extends ShaderComponentProps, HalftoneDotsParams {}

type HalftoneDotsPreset = ImageShaderPreset<HalftoneDotsParams>;

export const defaultPreset: HalftoneDotsPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#f2f1e8',
    colorFront: '#2b2b2b',
    size: 0.3,
    radius: 1.25,
    contrast: 0.4,
    originalColors: false,
    inverted: false,
    grainMixer: 0.2,
    grainOverlay: 0.2,
    grainSize: 0.5,
    grid: 'hex',
    type: 'gooey',
  },
};

export const ledPreset: HalftoneDotsPreset = {
  name: 'LED screen',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#000000',
    colorFront: '#29ff7b',
    size: 0.5,
    radius: 1.5,
    contrast: 0.3,
    originalColors: false,
    inverted: false,
    grainMixer: 0,
    grainOverlay: 0,
    grainSize: 0.5,
    grid: 'square',
    type: 'soft',
  },
};

export const netPreset: HalftoneDotsPreset = {
  name: 'Mosaic',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#000000',
    colorFront: '#b2aeae',
    size: 0.6,
    radius: 2,
    contrast: 0.01,
    originalColors: true,
    inverted: false,
    grainMixer: 0,
    grainOverlay: 0,
    grainSize: 0.5,
    grid: 'hex',
    type: 'classic',
  },
};

export const roundAndSquarePreset: HalftoneDotsPreset = {
  name: 'Round and square',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    colorBack: '#141414',
    colorFront: '#ff8000',
    size: 0.8,
    radius: 1,
    contrast: 1,
    originalColors: false,
    inverted: true,
    grainMixer: 0.05,
    grainOverlay: 0.3,
    grainSize: 0.5,
    grid: 'square',
    type: 'holes',
  },
};

export const halftoneDotsPresets: HalftoneDotsPreset[] = [defaultPreset, ledPreset, netPreset, roundAndSquarePreset];

export const HalftoneDots: React.FC<HalftoneDotsProps> = memo(function HalftoneDotsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  image = '',
  size = defaultPreset.params.size,
  radius = defaultPreset.params.radius,
  contrast = defaultPreset.params.contrast,
  originalColors = defaultPreset.params.originalColors,
  inverted = defaultPreset.params.inverted,
  grainMixer = defaultPreset.params.grainMixer,
  grainOverlay = defaultPreset.params.grainOverlay,
  grainSize = defaultPreset.params.grainSize,
  grid = defaultPreset.params.grid,
  type = defaultPreset.params.type,

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
}: HalftoneDotsProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_size: size,
    u_radius: radius,
    u_contrast: contrast,
    u_originalColors: originalColors,
    u_inverted: inverted,
    u_grainMixer: grainMixer,
    u_grainOverlay: grainOverlay,
    u_grainSize: grainSize,
    u_grid: HalftoneDotsGrids[grid],
    u_type: HalftoneDotsTypes[type],

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_rotation: rotation,
    u_scale: scale,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies HalftoneDotsUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={halftoneDotsFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
