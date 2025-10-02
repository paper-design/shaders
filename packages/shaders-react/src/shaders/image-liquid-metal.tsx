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
    scale: 4,
    speed: 0,
    frame: 3000,
    colorBack: '#00000000',
    colorTint: '#ffffff',
    softness: 0.2,
    repetition: 2,
    shiftRed: 0.25,
    shiftBlue: 0.3,
    distortion: 0.07,
    contourSoftness: 0,
    edgePower: 1.3,
  },
};

export const imageLiquidMetalPresets: ImageLiquidMetalPreset[] = [defaultPreset];

export const ImageLiquidMetal: React.FC<ImageLiquidMetalProps> = memo(function ImageLiquidMetalImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorTint = defaultPreset.params.colorTint,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = 'https://shaders.paper.design/images/image-filters/0019.webp',
  contourSoftness = defaultPreset.params.contourSoftness,
  edgePower = defaultPreset.params.edgePower,
  distortion = defaultPreset.params.distortion,
  softness = defaultPreset.params.softness,
  repetition = defaultPreset.params.repetition,
  shiftRed = defaultPreset.params.shiftRed,
  shiftBlue = defaultPreset.params.shiftBlue,
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
      (): Promise<string> => toProcessedImageLiquidMetal(imageUrl).then((result) => URL.createObjectURL(result.blob)),
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
        url = URL.createObjectURL(result.blob);
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
    u_softness: softness,
    u_repetition: repetition,
    u_contourSoftness: contourSoftness,
    u_edgePower: edgePower,
    u_distortion: distortion,
    u_shiftRed: shiftRed,
    u_shiftBlue: shiftBlue,

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
