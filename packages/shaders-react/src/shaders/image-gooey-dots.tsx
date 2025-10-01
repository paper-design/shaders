import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  imageGooeyDotsFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  type ImageGooeyDotsUniforms,
  type ImageGooeyDotsParams,
  defaultObjectSizing,
  type ImageShaderPreset,
} from '@paper-design/shaders';

export interface ImageGooeyDotsProps extends ShaderComponentProps, ImageGooeyDotsParams {
  /** @deprecated use `size` instead */
  pxSize?: number;
}

type ImageGooeyDotsPreset = ImageShaderPreset<ImageGooeyDotsParams>;

export const defaultPreset: ImageGooeyDotsPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#d4d4d4',
    colorFront: '#2b2b2b',
    size: 12,
    threshold: 0.3,
    contrast: 0.3,
  },
};

export const imageGooeyDotsPresets: ImageGooeyDotsPreset[] = [defaultPreset];

export const ImageGooeyDots: React.FC<ImageGooeyDotsProps> = memo(function ImageGooeyDotsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  image = '',
  pxSize,
  size = pxSize === undefined ? defaultPreset.params.size : pxSize,
  threshold = defaultPreset.params.threshold,
  contrast = defaultPreset.params.contrast,

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
}: ImageGooeyDotsProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_pxSize: size,
    u_threshold: threshold,
    u_contrast: contrast,

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
  } satisfies ImageGooeyDotsUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={imageGooeyDotsFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
