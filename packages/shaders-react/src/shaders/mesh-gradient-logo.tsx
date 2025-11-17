import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  meshGradientLogoFragmentShader,
  ShaderFitOptions,
  defaultObjectSizing,
  type MeshGradientLogoUniforms,
  type MeshGradientLogoParams,
  toProcessedMeshGradientLogo,
  type ImageShaderPreset,
  getShaderColorFromString,
} from '@paper-design/shaders';
import { transparentPixel } from '../transparent-pixel.js';
import { suspend } from '../suspend.js';

export interface MeshGradientLogoProps extends ShaderComponentProps, MeshGradientLogoParams {
  /**
   * Suspends the component when the image is being processed.
   */
  suspendWhenProcessingImage?: boolean;
}

type MeshGradientLogoPreset = ImageShaderPreset<MeshGradientLogoParams>;

export const defaultPreset: MeshGradientLogoPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 1,
    frame: 0,
    colorBack: '#c8dfd900',
    colorInner: '#c8dfd9',
    colors: ['#ff9d00', '#fd4f30', '#809bff', '#c5bac5'],
    size: 0.5,
    contour: 0.7,
  },
};
export const meshGradientLogoPresets: MeshGradientLogoPreset[] = [defaultPreset];

export const MeshGradientLogo: React.FC<MeshGradientLogoProps> = memo(function MeshGradientLogoImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorInner = defaultPreset.params.colorInner,
  colors = defaultPreset.params.colors,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  contour = defaultPreset.params.contour,
  size = defaultPreset.params.size,
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
}: MeshGradientLogoProps) {
  const imageUrl = typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  if (suspendWhenProcessingImage && typeof window !== 'undefined' && imageUrl) {
    processedImage = suspend(
      (): Promise<string> => toProcessedMeshGradientLogo(imageUrl).then((result) => URL.createObjectURL(result.pngBlob)),
      [imageUrl, 'meshGradientLogo']
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

    toProcessedMeshGradientLogo(imageUrl).then((result) => {
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
    u_contour: contour,
    u_size: size,

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
  } satisfies MeshGradientLogoUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={meshGradientLogoFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
