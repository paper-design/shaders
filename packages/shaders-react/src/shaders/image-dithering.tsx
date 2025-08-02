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
    scale: 0.85,
    speed: 0,
    frame: 0,
    colorFront: '#eeeeee',
    colorBack: '#5452ff',
    image: '/images/054.jpg',
    type: '4x4',
    pxSize: 2,
    stepsPerColor: 1,
    ownPalette: false,
  },
} as const;

export const imageDitheringPresets: ImageDitheringPreset[] = [defaultPreset];

export const ImageDithering: React.FC<ImageDitheringProps> = memo(function ImageDitheringImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  image = defaultPreset.params.image,
  type = defaultPreset.params.type,
  pxSize = defaultPreset.params.pxSize,
  stepsPerColor = defaultPreset.params.stepsPerColor,
  ownPalette = defaultPreset.params.ownPalette,

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
    u_type: DitheringTypes[type],
    u_pxSize: pxSize,
    u_stepsPerColor: stepsPerColor,
    u_ownPalette: ownPalette,

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
