import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  foldsFragmentShader,
  ShaderFitOptions,
  defaultObjectSizing,
  type FoldsUniforms,
  type FoldsParams,
  toProcessedFolds,
  type ImageShaderPreset,
  getShaderColorFromString,
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
    scale: 0.8,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colorInner: '#000000',
    colors: ['#334D4D', '#8080B3'],
    stripeWidth: 1,
    alphaMask: true,
    noiseScale: 1,
    size: 10,
    shift: 0.5,
    noise: 0.5,
    outerNoise: 0.33,
    bevel: 0.5,
    overlayHeight: 0.2,
    overlayBevel: 0.2,
  },
};


export const foldsPresets: FoldsPreset[] = [defaultPreset];

export const Folds: React.FC<FoldsProps> = memo(function FoldsImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorInner = defaultPreset.params.colorInner,
  colors = defaultPreset.params.colors,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  shift = defaultPreset.params.shift,
  noise = defaultPreset.params.noise,
  outerNoise = defaultPreset.params.outerNoise,
  bevel = defaultPreset.params.bevel,
  overlayHeight = defaultPreset.params.overlayHeight,
  stripeWidth = defaultPreset.params.stripeWidth,
  alphaMask = defaultPreset.params.alphaMask,
  noiseScale = defaultPreset.params.noiseScale,
  size = defaultPreset.params.size,
  overlayBevel = defaultPreset.params.overlayBevel,
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
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorInner: getShaderColorFromString(colorInner),
    u_image: processedImage,
    u_shift: shift,
    u_noise: noise,
    u_outerNoise: outerNoise,
    u_bevel: bevel,
    u_overlayHeight: overlayHeight,
    u_stripeWidth: stripeWidth,
    u_alphaMask: alphaMask,
    u_noiseScale: noiseScale,
    u_size: size,
    u_overlayBevel: overlayBevel,

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
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
