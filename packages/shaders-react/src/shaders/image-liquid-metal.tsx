import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  imageLiquidMetalFragmentShader,
  ShaderFitOptions,
  defaultObjectSizing,
  type ImageLiquidMetalUniforms,
  type ImageLiquidMetalParams,
  toProcessedImageLiquidMetal,
  type ImageShaderPreset,
  getShaderColorFromString,
  ImageLiquidMetalShapes,
} from '@paper-design/shaders';
import { transparentPixel } from '../transparent-pixel.js';
import { suspend } from '../suspend.js';

export interface ImageLiquidMetalProps extends ShaderComponentProps, ImageLiquidMetalParams {
  /**
   * Suspends the component when the image is being processed.
   */
  suspendWhenProcessingImage?: boolean;
}

type ImageLiquidMetalPreset = ImageShaderPreset<ImageLiquidMetalParams>;

export const defaultPreset: ImageLiquidMetalPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colorTint: '#ffffff',
    distortion: 0.07,
    repetition: 2.0,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    contour: 0.4,
    softness: 0.1,
    isImage: 1,
    shape: 'circle',
  },
};

export const oldDefaultPreset: ImageLiquidMetalPreset = {
  name: 'Old default',
  params: {
    ...defaultObjectSizing,
    scale: 0.6,
    speed: 1,
    frame: 8000,
    colorBack: '#000000',
    colorTint: '#ffffff',
    softness: 0.3,
    repetition: 4,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    distortion: 0.1,
    contour: 1,
    isImage: 0,
    shape: 'circle',
  },
};

export const imageLiquidMetalPresets: ImageLiquidMetalPreset[] = [defaultPreset, oldDefaultPreset];

export const ImageLiquidMetal: React.FC<ImageLiquidMetalProps> = memo(function ImageLiquidMetalImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorTint = defaultPreset.params.colorTint,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  contour = defaultPreset.params.contour,
  distortion = defaultPreset.params.distortion,
  softness = defaultPreset.params.softness,
  repetition = defaultPreset.params.repetition,
  shiftRed = defaultPreset.params.shiftRed,
  shiftBlue = defaultPreset.params.shiftBlue,
  isImage = defaultPreset.params.isImage,
  shape = defaultPreset.params.shape,
  suspendWhenProcessingImage = false,

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
}: ImageLiquidMetalProps) {
  const imageUrl = typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  if (suspendWhenProcessingImage && typeof window !== 'undefined') {
    processedImage = suspend(
      (): Promise<string> => toProcessedImageLiquidMetal(imageUrl).then((result) => URL.createObjectURL(result.pngBlob)),
      [imageUrl, 'image-liquid-metal']
    );
  } else {
    processedImage = processedStateImage;
  }

  useLayoutEffect(() => {
    if (suspendWhenProcessingImage) {
      // Skip doing work in the effect as it's been handled by suspense.
      return;
    }

    if (!imageUrl) {
      setProcessedStateImage(transparentPixel);
      return;
    }

    let url: string;
    let current = true;

    toProcessedImageLiquidMetal(imageUrl).then((result) => {
      if (current) {
        url = URL.createObjectURL(result.pngBlob);
        setProcessedStateImage(url);
      }
    });

    return () => {
      current = false;
      URL.revokeObjectURL(url);
    };
  }, [imageUrl, suspendWhenProcessingImage]);

  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorTint: getShaderColorFromString(colorTint),

    u_image: processedImage,
    u_contour: contour,
    u_distortion: distortion,
    u_softness: softness,
    u_repetition: repetition,
    u_shiftRed: shiftRed,
    u_shiftBlue: shiftBlue,
    u_isImage: isImage,
    u_shape: ImageLiquidMetalShapes[shape],

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
  } satisfies ImageLiquidMetalUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={imageLiquidMetalFragmentShader}
      uniforms={uniforms}
    />
  );
});
