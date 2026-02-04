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
    scale: 0.7,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colorBase: '#b46bb8',
    colors: ['#e0992e', '#35bbbb', '#05006b'],
    lightsPower: 0.38,
    lightsPos: 242,
  },
};

export const logo3dPresets: Logo3dPreset[] = [defaultPreset];

export const Logo3d: React.FC<Logo3dProps> = memo(function Logo3dImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorBase = defaultPreset.params.colorBase,
  colors = defaultPreset.params.colors,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  lightsPower = defaultPreset.params.lightsPower,
  lightsPos = defaultPreset.params.lightsPos,
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
    u_colorBase: getShaderColorFromString(colorBase),
    u_image: processedImage,
    u_lightsPower: lightsPower,
    u_lightsPos: lightsPos,

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
