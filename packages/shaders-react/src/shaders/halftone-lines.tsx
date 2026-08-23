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
    colorMid: '#0000ff',
    gridType: 'radial',
    gridOffset: 0.54,
    strokeWidth: 0,
    strokeKeepGaps: true,
    strokeKeepWidth: true,
    strokeSoftness: 0,
    imageSoftness: 0.35,
    colorSoftness: 0,
    gridSize: 0.75,
    gridNoise: 0.0,
    gridContouring: 0,
    gridRotation: 0,
    strokeContrast: 0.7,
    originalColors: false,
    strokeInverted: false,
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
    colorMid: '#ffffff',
    gridType: 'lines',
    gridOffset: -0.5,
    strokeWidth: 0.5,
    strokeKeepGaps: true,
    strokeKeepWidth: false,
    strokeSoftness: 0,
    imageSoftness: 0.35,
    colorSoftness: 0,
    gridSize: 0.3,
    gridNoise: 1.0,
    gridContouring: 1,
    gridRotation: 0,
    strokeContrast: 0.7,
    originalColors: false,
    strokeInverted: false,
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
    colorMid: '#1e1e2f',
    gridType: 'waves',
    gridOffset: 0,
    strokeWidth: 0.8,
    strokeKeepGaps: false,
    strokeKeepWidth: false,
    strokeSoftness: 0,
    imageSoftness: 0.35,
    colorSoftness: 0,
    gridSize: 0.8,
    gridNoise: 1.0,
    gridContouring: 1,
    gridRotation: 0,
    strokeContrast: 0.5,
    originalColors: false,
    strokeInverted: false,
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
    colorMid: '#000000',
    gridType: 'lines',
    gridOffset: -0.5,
    strokeWidth: 1,
    strokeKeepGaps: false,
    strokeKeepWidth: false,
    strokeSoftness: 0,
    imageSoftness: 0.35,
    colorSoftness: 0,
    gridSize: 0.6,
    gridNoise: 0.0,
    gridContouring: 0,
    gridRotation: 0,
    strokeContrast: 0.7,
    originalColors: false,
    strokeInverted: false,
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
    colorMid: '#ffffff',
    gridType: 'waves',
    gridOffset: -0.5,
    strokeWidth: 1,
    strokeKeepGaps: false,
    strokeKeepWidth: false,
    strokeSoftness: 0,
    imageSoftness: 0,
    colorSoftness: 0,
    gridSize: 1,
    gridNoise: 0.0,
    gridContouring: 0,
    gridRotation: 0,
    strokeContrast: 0.15,
    originalColors: true,
    strokeInverted: false,
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
  colorMid = defaultPreset.params.colorMid,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  gridType = defaultPreset.params.gridType,
  gridOffset = defaultPreset.params.gridOffset,
  gridNoise = defaultPreset.params.gridNoise,
  gridContouring = defaultPreset.params.gridContouring,
  strokeWidth = defaultPreset.params.strokeWidth,
  strokeKeepGaps = defaultPreset.params.strokeKeepGaps,
  strokeKeepWidth = defaultPreset.params.strokeKeepWidth,
  strokeSoftness = defaultPreset.params.strokeSoftness,
  imageSoftness = defaultPreset.params.imageSoftness,
  colorSoftness = defaultPreset.params.colorSoftness,
  gridSize = defaultPreset.params.gridSize,
  gridRotation = defaultPreset.params.gridRotation,
  strokeContrast = defaultPreset.params.strokeContrast,
  originalColors = defaultPreset.params.originalColors,
  strokeInverted = defaultPreset.params.strokeInverted,
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
    u_colorMid: getShaderColorFromString(colorMid),

    u_image: image,
    u_gridType: HalftoneLinesGrids[gridType],
    u_gridOffset: gridOffset,
    u_gridNoise: gridNoise,
    u_gridContouring: gridContouring,
    u_strokeWidth: strokeWidth,
    u_strokeKeepGaps: strokeKeepGaps,
    u_strokeKeepWidth: strokeKeepWidth,
    u_strokeSoftness: strokeSoftness,
    u_imageSoftness: imageSoftness,
    u_colorSoftness: colorSoftness,
    u_gridSize: gridSize,
    u_gridRotation: gridRotation,
    u_strokeContrast: strokeContrast,
    u_originalColors: originalColors,
    u_strokeInverted: strokeInverted,
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
