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
    colorMid: '#0000ff',
    colorFront: '#ff006a',
    originalColors: false,
    colorSoftness: 0,
    strokeWidth: 1,
    strokeContrast: 0.7,
    strokesRounding: 0.35,
    strokeInverted: false,
    strokeSoftness: 0,
    strokeKeepGaps: false,
    strokeKeepWidth: true,
    gridType: 'radial',
    gridSize: 0.75,
    gridOffset: 0.54,
    gridRotation: 0,
    gridNoise: 0.0,
    gridContouring: 0,
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
    colorMid: '#ffffff',
    colorFront: '#ffffff',
    originalColors: false,
    colorSoftness: 0,
    strokeWidth: 0.5,
    strokeContrast: 0.7,
    strokesRounding: 0.35,
    strokeInverted: false,
    strokeSoftness: 0,
    strokeKeepGaps: true,
    strokeKeepWidth: false,
    gridType: 'lines',
    gridSize: 0.3,
    gridOffset: -0.5,
    gridRotation: 0,
    gridNoise: 1.0,
    gridContouring: 1,
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
    colorMid: '#1e1e2f',
    colorFront: '#1e1e2f',
    originalColors: false,
    colorSoftness: 0,
    strokeWidth: 0.8,
    strokeContrast: 0.5,
    strokesRounding: 0.35,
    strokeInverted: false,
    strokeSoftness: 0,
    strokeKeepGaps: false,
    strokeKeepWidth: false,
    gridType: 'waves',
    gridSize: 0.8,
    gridOffset: 0,
    gridRotation: 0,
    gridNoise: 1.0,
    gridContouring: 1,
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
    colorMid: '#000000',
    colorFront: '#000000',
    originalColors: false,
    colorSoftness: 0,
    strokeWidth: 1,
    strokeContrast: 0.7,
    strokesRounding: 0.35,
    strokeInverted: false,
    strokeSoftness: 0,
    strokeKeepGaps: false,
    strokeKeepWidth: false,
    gridType: 'lines',
    gridSize: 0.6,
    gridOffset: -0.5,
    gridRotation: 0,
    gridNoise: 0.0,
    gridContouring: 0,
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
    colorMid: '#ffffff',
    colorFront: '#ffffff',
    originalColors: true,
    colorSoftness: 0,
    strokeWidth: 1,
    strokeContrast: 0.15,
    strokesRounding: 0,
    strokeInverted: false,
    strokeSoftness: 0,
    strokeKeepGaps: false,
    strokeKeepWidth: false,
    gridType: 'waves',
    gridSize: 1,
    gridOffset: -0.5,
    gridRotation: 0,
    gridNoise: 0.0,
    gridContouring: 0,
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
  colorMid = defaultPreset.params.colorMid,
  colorFront = defaultPreset.params.colorFront,
  originalColors = defaultPreset.params.originalColors,
  colorSoftness = defaultPreset.params.colorSoftness,
  strokeWidth = defaultPreset.params.strokeWidth,
  strokeContrast = defaultPreset.params.strokeContrast,
  strokesRounding = defaultPreset.params.strokesRounding,
  strokeInverted = defaultPreset.params.strokeInverted,
  strokeSoftness = defaultPreset.params.strokeSoftness,
  strokeKeepGaps = defaultPreset.params.strokeKeepGaps,
  strokeKeepWidth = defaultPreset.params.strokeKeepWidth,
  gridType = defaultPreset.params.gridType,
  gridSize = defaultPreset.params.gridSize,
  gridOffset = defaultPreset.params.gridOffset,
  gridRotation = defaultPreset.params.gridRotation,
  gridNoise = defaultPreset.params.gridNoise,
  gridContouring = defaultPreset.params.gridContouring,
  grainMixer = defaultPreset.params.grainMixer,
  grainMixerSize = defaultPreset.params.grainMixerSize,
  grainOverlay = defaultPreset.params.grainOverlay,
  grainOverlaySize = defaultPreset.params.grainOverlaySize,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',

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
    u_colorMid: getShaderColorFromString(colorMid),
    u_colorFront: getShaderColorFromString(colorFront),
    u_originalColors: originalColors,
    u_colorSoftness: colorSoftness,
    u_strokeWidth: strokeWidth,
    u_strokeContrast: strokeContrast,
    u_strokesRounding: strokesRounding,
    u_strokeInverted: strokeInverted,
    u_strokeSoftness: strokeSoftness,
    u_strokeKeepGaps: strokeKeepGaps,
    u_strokeKeepWidth: strokeKeepWidth,
    u_gridType: HalftoneLinesGrids[gridType],
    u_gridSize: gridSize,
    u_gridOffset: gridOffset,
    u_gridRotation: gridRotation,
    u_gridNoise: gridNoise,
    u_gridContouring: gridContouring,
    u_grainMixer: grainMixer,
    u_grainMixerSize: grainMixerSize,
    u_grainOverlay: grainOverlay,
    u_grainOverlaySize: grainOverlaySize,

    u_image: image,

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
