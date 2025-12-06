import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  logo3dFragmentShader,
  ShaderFitOptions,
  defaultObjectSizing,
  type Logo3dUniforms,
  type Logo3dParams,
  toProcessedLogo3d,
  type ImageShaderPreset,
  getShaderColorFromString,
} from '@paper-design/shaders';
import { transparentPixel } from '../transparent-pixel.js';
import { suspend } from '../suspend.js';

export interface Logo3dProps extends ShaderComponentProps, Logo3dParams {
  /**
   * Suspends the component when the image is being processed.
   */
  suspendWhenProcessingImage?: boolean;
}

type Logo3dPreset = ImageShaderPreset<Logo3dParams>;

export const defaultPreset: Logo3dPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 4,
    frame: 0,
    colorBack: '#000000',
    colorUnderlay: '#0d0d0d',
    colorOverlay: '#c2c4ff',
    colors: ['#75faff', '#ff6666'],
    test: 0.33,
    bevel: 0.1,
  },
};

export const logo3dPresets: Logo3dPreset[] = [defaultPreset];

export const Logo3d: React.FC<Logo3dProps> = memo(function Logo3dImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorUnderlay = defaultPreset.params.colorUnderlay,
  colorOverlay = defaultPreset.params.colorOverlay,
  colors = defaultPreset.params.colors,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  test = defaultPreset.params.test,
  bevel = defaultPreset.params.bevel,
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
}: Logo3dProps) {
  const imageUrl = typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  if (suspendWhenProcessingImage && typeof window !== 'undefined' && imageUrl) {
    processedImage = suspend(
      (): Promise<string> => toProcessedLogo3d(imageUrl).then((result) => URL.createObjectURL(result.pngBlob)),
      [imageUrl, 'logo3d']
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

    toProcessedLogo3d(imageUrl).then((result) => {
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
    u_colorUnderlay: getShaderColorFromString(colorUnderlay),
    u_colorOverlay: getShaderColorFromString(colorOverlay),
    u_image: processedImage,
    u_test: test,
    u_bevel: bevel,

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
  } satisfies Logo3dUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={logo3dFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
