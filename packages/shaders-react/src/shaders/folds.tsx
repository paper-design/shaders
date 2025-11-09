import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  foldsFragmentShader,
  ShaderFitOptions,
  defaultObjectSizing,
  type FoldsUniforms,
  type FoldsParams,
  toProcessedFolds,
  type ImageShaderPreset,
  getShaderColorFromString,
  FoldsShapes,
} from '@paper-design/shaders';
import { transparentPixel } from '../transparent-pixel.js';
import { suspend } from '../suspend.js';

export interface FoldsProps extends ShaderComponentProps, FoldsParams {
  /**
   * Suspends the component when the image is being processed.
   */
  suspendWhenProcessingImage?: boolean;
}

type FoldsPreset = ImageShaderPreset<FoldsParams>;

export const defaultPreset: FoldsPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 1,
    frame: 0,
    colorBack: '#ffffff',
    colorFront: '#000000',
    distortion: 0.07,
    repetition: 2.0,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    contour: 0.4,
    softness: 0.1,
    angle: 70,
    shape: 'diamond',
  },
};
export const foldsPresets: FoldsPreset[] = [defaultPreset];

export const Folds: React.FC<FoldsProps> = memo(function FoldsImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorFront = defaultPreset.params.colorFront,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  contour = defaultPreset.params.contour,
  distortion = defaultPreset.params.distortion,
  softness = defaultPreset.params.softness,
  repetition = defaultPreset.params.repetition,
  shiftRed = defaultPreset.params.shiftRed,
  shiftBlue = defaultPreset.params.shiftBlue,
  angle = defaultPreset.params.angle,
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
}: FoldsProps) {
  const imageUrl = typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  if (suspendWhenProcessingImage && typeof window !== 'undefined' && imageUrl) {
    processedImage = suspend(
      (): Promise<string> => toProcessedFolds(imageUrl).then((result) => URL.createObjectURL(result.pngBlob)),
      [imageUrl, 'folds']
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

    toProcessedFolds(imageUrl).then((result) => {
      if (current) {
        url = URL.createObjectURL(result.pngBlob);
        setProcessedStateImage(url);
      }
    });

    return () => {
      current = false;
    };
  }, [imageUrl, suspendWhenProcessingImage]);

  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFront: getShaderColorFromString(colorFront),

    u_image: processedImage,
    u_contour: contour,
    u_distortion: distortion,
    u_softness: softness,
    u_repetition: repetition,
    u_shiftRed: shiftRed,
    u_shiftBlue: shiftBlue,
    u_angle: angle,
    u_isImage: Boolean(image),
    u_shape: FoldsShapes[shape],

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
  } satisfies FoldsUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={foldsFragmentShader}
      uniforms={uniforms}
    />
  );
});
