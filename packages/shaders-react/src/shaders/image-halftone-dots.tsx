import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  imageHalftoneDotsFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  type ImageHalftoneDotsUniforms,
  type ImageHalftoneDotsParams,
  defaultObjectSizing,
  type ImageShaderPreset,
  ImageHalftoneDotsTypes,
} from '@paper-design/shaders';

export interface ImageHalftoneDotsProps extends ShaderComponentProps, ImageHalftoneDotsParams {}

type ImageHalftoneDotsPreset = ImageShaderPreset<ImageHalftoneDotsParams>;

export const defaultPreset: ImageHalftoneDotsPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#d4d4d4',
    colorFront: '#2b2b2b',
    size: 5,
    radius: 1,
    contrast: 0.5,
    originalColors: false,
    inverted: false,
    grainMixer: 0,
    grainOverlay: 0,
    diagonalGrid: true,
    type: 'gooey',
  },
};

export const abstractPreset: ImageHalftoneDotsPreset = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colorFront: '#2b2b2b',
    size: 25,
    radius: 2,
    contrast: 0.45,
    originalColors: true,
    inverted: false,
    grainMixer: 0,
    grainOverlay: 0,
    diagonalGrid: true,
    type: 'classic',
  },
};

export const netPreset: ImageHalftoneDotsPreset = {
  name: 'Net',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colorFront: '#2b2b2b',
    size: 12,
    radius: 2,
    contrast: 0,
    originalColors: true,
    inverted: false,
    grainMixer: 0,
    grainOverlay: 0,
    diagonalGrid: true,
    type: 'classic',
  },
};

export const holesPreset: ImageHalftoneDotsPreset = {
  name: 'Holes',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#ffffff00',
    colorFront: '#0012b3',
    size: 10,
    radius: 1.4,
    contrast: 0.35,
    originalColors: false,
    inverted: false,
    grainMixer: 0,
    grainOverlay: 0,
    diagonalGrid: false,
    type: 'hole',
  },
};

export const imageHalftoneDotsPresets: ImageHalftoneDotsPreset[] = [
  defaultPreset,
  abstractPreset,
  netPreset,
  holesPreset,
];

export const ImageHalftoneDots: React.FC<ImageHalftoneDotsProps> = memo(function ImageHalftoneDotsImpl({
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
  diagonalGrid = defaultPreset.params.diagonalGrid,
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
}: ImageHalftoneDotsProps) {
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
    u_diagonalGrid: diagonalGrid,
    u_type: ImageHalftoneDotsTypes[type],

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
  } satisfies ImageHalftoneDotsUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={imageHalftoneDotsFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
