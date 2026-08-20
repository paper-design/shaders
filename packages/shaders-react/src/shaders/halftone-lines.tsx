import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  halftoneLinesFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  type HalftoneLinesUniforms,
  type HalftoneLinesParams,
  defaultObjectSizing,
  type ImageShaderPreset,
  HalftoneLinesGrids,
} from '@paper-design/shaders';

export interface HalftoneLinesProps extends ShaderComponentProps, HalftoneLinesParams {}

type HalftoneLinesPreset = ImageShaderPreset<HalftoneLinesParams>;

export const defaultPreset: HalftoneLinesPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#f1ffe0',
    colorFront: '#ff006a',
    grid: 'radial',
    gridOffsetX: -0.5,
    gridOffsetY: -0.2,
    strokeWidth: 1,
    softness: 0,
    smoothness: 0.35,
    colorSmoothness: 0,
    gridSize: 0.75,
    gridAngleDistortion: 0,
    gridNoiseDistortion: 0,
    gridRotation: 55,
    contrast: 0.7,
    originalColors: false,
    inverted: false,
    grainMixer: 0.2,
    grainMixerSize: 1,
    grainOverlay: 0,
    grainOverlaySize: 0.5,
  },
};

export const noisePreset: HalftoneLinesPreset = {
  name: 'Noisy',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#615681',
    colorFront: '#ffffff',
    grid: 'noise',
    gridOffsetX: -0.5,
    gridOffsetY: -0.5,
    strokeWidth: 0.5,
    softness: 0,
    smoothness: 0.35,
    colorSmoothness: 0,
    gridSize: 0.3,
    gridAngleDistortion: 0,
    gridNoiseDistortion: 0,
    gridRotation: 0,
    contrast: 0.7,
    originalColors: false,
    inverted: false,
    grainMixer: 0.2,
    grainMixerSize: 1,
    grainOverlay: 0,
    grainOverlaySize: 0.5,
  },
};

export const strokesPreset: HalftoneLinesPreset = {
  name: 'Strokes',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#b7a42a',
    colorFront: '#1e1e2f',
    grid: 'waves',
    gridOffsetX: -0.5,
    gridOffsetY: -0.5,
    strokeWidth: 0.8,
    softness: 0,
    smoothness: 0.35,
    colorSmoothness: 0,
    gridSize: 0.8,
    gridAngleDistortion: 0.3,
    gridNoiseDistortion: 1,
    gridRotation: 0,
    contrast: 0.5,
    originalColors: false,
    inverted: false,
    grainMixer: 0.62,
    grainMixerSize: 0.9,
    grainOverlay: 0,
    grainOverlaySize: 0.5,
  },
};

export const classicPreset: HalftoneLinesPreset = {
  name: 'Classic',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    colorFront: '#000000',
    grid: 'lines',
    gridOffsetX: -0.5,
    gridOffsetY: -0.5,
    strokeWidth: 1,
    softness: 0,
    smoothness: 0.35,
    colorSmoothness: 0,
    gridSize: 0.6,
    gridAngleDistortion: 0,
    gridNoiseDistortion: 0,
    gridRotation: 0,
    contrast: 0.7,
    originalColors: false,
    inverted: false,
    grainMixer: 0,
    grainMixerSize: 1,
    grainOverlay: 0,
    grainOverlaySize: 0.5,
  },
};

export const artyPreset: HalftoneLinesPreset = {
  name: 'Arty',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#ff8d5c',
    colorFront: '#ffffff',
    grid: 'waves',
    gridOffsetX: -0.5,
    gridOffsetY: -0.5,
    strokeWidth: 1,
    softness: 0,
    smoothness: 0,
    colorSmoothness: 0,
    gridSize: 1,
    gridAngleDistortion: 0,
    gridNoiseDistortion: 0,
    gridRotation: 0,
    contrast: 0.15,
    originalColors: true,
    inverted: false,
    grainMixer: 0,
    grainMixerSize: 1,
    grainOverlay: 0,
    grainOverlaySize: 0.5,
  },
};

export const halftoneLinesPresets: HalftoneLinesPreset[] = [
  defaultPreset,
  strokesPreset,
  noisePreset,
  artyPreset,
  classicPreset,
];

export const HalftoneLines: React.FC<HalftoneLinesProps> = memo(function HalftoneLinesImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorFront = defaultPreset.params.colorFront,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  grid = defaultPreset.params.grid,
  gridOffsetX = defaultPreset.params.gridOffsetX,
  gridOffsetY = defaultPreset.params.gridOffsetY,
  gridAngleDistortion = defaultPreset.params.gridAngleDistortion,
  gridNoiseDistortion = defaultPreset.params.gridNoiseDistortion,
  strokeWidth = defaultPreset.params.strokeWidth,
  softness = defaultPreset.params.softness,
  smoothness = defaultPreset.params.smoothness,
  colorSmoothness = defaultPreset.params.colorSmoothness,
  gridSize = defaultPreset.params.gridSize,
  gridRotation = defaultPreset.params.gridRotation,
  contrast = defaultPreset.params.contrast,
  originalColors = defaultPreset.params.originalColors,
  inverted = defaultPreset.params.inverted,
  grainMixer = defaultPreset.params.grainMixer,
  grainMixerSize = defaultPreset.params.grainMixerSize,
  grainOverlay = defaultPreset.params.grainOverlay,
  grainOverlaySize = defaultPreset.params.grainOverlaySize,

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
}: HalftoneLinesProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFront: getShaderColorFromString(colorFront),

    u_image: image,
    u_grid: HalftoneLinesGrids[grid],
    u_gridOffsetX: gridOffsetX,
    u_gridOffsetY: gridOffsetY,
    u_gridAngleDistortion: gridAngleDistortion,
    u_gridNoiseDistortion: gridNoiseDistortion,
    u_strokeWidth: strokeWidth,
    u_softness: softness,
    u_smoothness: smoothness,
    u_colorSmoothness: colorSmoothness,
    u_gridSize: gridSize,
    u_gridRotation: gridRotation,
    u_contrast: contrast,
    u_originalColors: originalColors,
    u_inverted: inverted,
    u_grainMixer: grainMixer,
    u_grainMixerSize: grainMixerSize,
    u_grainOverlay: grainOverlay,
    u_grainOverlaySize: grainOverlaySize,

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
  } satisfies HalftoneLinesUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={halftoneLinesFragmentShader}
      uniforms={uniforms}
      mipmaps={['u_image']}
    />
  );
});
