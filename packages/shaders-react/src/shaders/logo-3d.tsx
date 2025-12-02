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
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colorInner: '#000000',
    colors: ['#14f7ff', '#ff0a0a'],
    stripeWidth: 1,
    alphaMask: true,
    noiseScale: 1,
    size: 10,
    shift: 0.5,
    noise: 0.5,
    outerNoise: 0.33,
    bevel: 0.5,
    overlayHeight: 0.35,
    overlayBevel: 0.2,
  },
};

export const logo3dPresets: Logo3dPreset[] = [defaultPreset];

export const Logo3d: React.FC<Logo3dProps> = memo(function Logo3dImpl({
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
