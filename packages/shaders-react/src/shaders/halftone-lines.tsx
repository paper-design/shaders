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
    colorBack: '#fffcf0',
    colorMid: '#243fc6',
    colorFront: '#000000',
    originalColors: false,
    colorSoftness: 0.5,
    strokeWidth: 1,
    strokeContrast: 1,
    strokesRounding: 0.4,
    strokeInverted: false,
    strokeSoftness: 0,
    strokeKeepGaps: false,
    strokeKeepWidth: true,
    gridType: 'radial',
    gridSize: 0.54,
    gridOffset: -0.5,
    gridRotation: 125,
    gridNoise: 0,
    gridContouring: 0,
    grainMixer: 0,
    grainMixerSize: 1,
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
    colorFront: '#5c50b9',
    originalColors: false,
    colorSoftness: 1,
    strokeWidth: 0.6,
    strokeContrast: 0.5,
    strokesRounding: 0.33,
    strokeInverted: false,
    strokeSoftness: 0,
    strokeKeepGaps: false,
    strokeKeepWidth: false,
    gridType: 'lines',
    gridSize: 0.38,
    gridOffset: -0.5,
    gridRotation: 0,
    gridNoise: 0,
    gridContouring: 0,
    grainMixer: 0,
    grainMixerSize: 1,
    grainOverlay: 0.18,
    grainOverlaySize: 0.5,
  },
};

export const noisyPreset: HalftoneLinesPreset = {
  name: 'Noisy',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#2b2932',
    colorMid: '#00e1ff',
    colorFront: '#33faae',
    originalColors: false,
    colorSoftness: 1,
    strokeWidth: 1,
    strokeContrast: 0.67,
    strokesRounding: 0.59,
    strokeInverted: false,
    strokeSoftness: 0,
    strokeKeepGaps: true,
    strokeKeepWidth: false,
    gridType: 'wavesIrregular',
    gridSize: 0.85,
    gridOffset: 0,
    gridRotation: 0,
    gridNoise: 1,
    gridContouring: 0,
    grainMixer: 0,
    grainMixerSize: 1,
    grainOverlay: 0,
    grainOverlaySize: 0.5,
  },
};

export const photoPreset: HalftoneLinesPreset = {
  name: 'Photo',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#d4aa73',
    colorMid: '#ffffff',
    colorFront: '#ffffff',
    originalColors: true,
    colorSoftness: 0,
    strokeWidth: 0.85,
    strokeContrast: 0.3,
    strokesRounding: 0.66,
    strokeInverted: false,
    strokeSoftness: 0,
    strokeKeepGaps: false,
    strokeKeepWidth: false,
    gridType: 'waves',
    gridSize: 1,
    gridOffset: 0,
    gridRotation: 0,
    gridNoise: 0,
    gridContouring: 0,
    grainMixer: 0,
    grainMixerSize: 1,
    grainOverlay: 0,
    grainOverlaySize: 0.5,
  },
};

export const halftoneLinesPresets: HalftoneLinesPreset[] = [defaultPreset, classicPreset, noisyPreset, photoPreset];

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
