import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  warpLogoFragmentShader,
  ShaderFitOptions,
  defaultObjectSizing,
  type WarpLogoUniforms,
  type WarpLogoParams,
  toProcessedWarpLogo,
  type ImageShaderPreset,
  getShaderColorFromString,
} from '@paper-design/shaders';
import { transparentPixel } from '../transparent-pixel.js';
import { suspend } from '../suspend.js';

export interface WarpLogoProps extends ShaderComponentProps, WarpLogoParams {
  /**
   * Suspends the component when the image is being processed.
   */
  suspendWhenProcessingImage?: boolean;
}

type WarpLogoPreset = ImageShaderPreset<WarpLogoParams>;

export const defaultPreset: WarpLogoPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.65,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colors: ['#b3d5cc', '#ffda75', '#ff8a9b', '#4058a5'],
    outerVisibility: 0.5,
    distortion: 0.9,
    innerFill: 0,
    outerDistortion: 0.85,
  },
};
export const warpLogoPresets: WarpLogoPreset[] = [defaultPreset];

export const WarpLogo: React.FC<WarpLogoProps> = memo(function WarpLogoImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  distortion = defaultPreset.params.distortion,
  outerVisibility = defaultPreset.params.outerVisibility,
  innerFill = defaultPreset.params.innerFill,
  outerDistortion = defaultPreset.params.outerDistortion,
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
}: WarpLogoProps) {
  const imageUrl = typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  if (suspendWhenProcessingImage && typeof window !== 'undefined' && imageUrl) {
    processedImage = suspend(
      (): Promise<string> => toProcessedWarpLogo(imageUrl).then((result) => URL.createObjectURL(result.pngBlob)),
      [imageUrl, 'warpLogo']
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

    toProcessedWarpLogo(imageUrl).then((result) => {
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
    u_image: processedImage,
    u_distortion: distortion,
    u_outerVisibility: outerVisibility,
    u_innerFill: innerFill,
    u_outerDistortion: outerDistortion,

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
  } satisfies WarpLogoUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={warpLogoFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
