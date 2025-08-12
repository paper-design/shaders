import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  imageDitheringFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  type ImageDitheringUniforms,
  type ImageDitheringParams,
  type ShaderPreset,
  defaultObjectSizing,
  DitheringTypes,
} from '@paper-design/shaders';

export interface ImageDitheringProps extends ShaderComponentProps, ImageDitheringParams {}

type ImageDitheringPreset = ShaderPreset<ImageDitheringParams>;

export const defaultPreset: ImageDitheringPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    // fit: 'cover',
    // scale: 0.95,
    speed: 0,
    frame: 0,
    colorFront: '#94ffaf',
    colorBack: '#000c38',
    colorHighlight: '#eaff94',
    image: '/images/image-filters/0018.webp',
    type: '8x8',
    pxSize: 2,
    colorSteps: 2,
    originalColors: false,
  },
} as const;

export const retroPreset: ImageDitheringPreset = {
  name: 'Retro',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    colorFront: '#eeeeee',
    colorBack: '#5452ff',
    colorHighlight: '#eeeeee',
    image: '/images/image-filters/0018.webp',
    type: '2x2',
    pxSize: 3,
    colorSteps: 1,
    originalColors: true,
  },
} as const;

export const noisePreset: ImageDitheringPreset = {
  name: 'Noise',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    colorFront: '#a2997c',
    colorBack: '#000000',
    colorHighlight: '#ededed',
    image: '/images/image-filters/0018.webp',
    type: 'random',
    pxSize: 1,
    colorSteps: 1,
    originalColors: false,
  },
} as const;

export const naturalPreset: ImageDitheringPreset = {
  name: 'Natural',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    colorFront: '#ffffff',
    colorBack: '#000000',
    colorHighlight: '#ffffff',
    image: '/images/image-filters/0018.webp',
    type: '8x8',
    pxSize: 2,
    colorSteps: 5,
    originalColors: true,
  },
} as const;

export const imageDitheringPresets: ImageDitheringPreset[] = [defaultPreset, noisePreset, retroPreset, naturalPreset];

export const ImageDithering: React.FC<ImageDitheringProps> = memo(function ImageDitheringImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  colorHighlight = defaultPreset.params.colorHighlight,
  image = defaultPreset.params.image,
  type = defaultPreset.params.type,
  pxSize = defaultPreset.params.pxSize,
  colorSteps = defaultPreset.params.colorSteps,
  originalColors = defaultPreset.params.originalColors,

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
}: ImageDitheringProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorHighlight: getShaderColorFromString(colorHighlight),
    u_type: DitheringTypes[type],
    u_pxSize: pxSize,
    u_colorSteps: colorSteps,
    u_originalColors: originalColors,

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
  } satisfies ImageDitheringUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={imageDitheringFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
