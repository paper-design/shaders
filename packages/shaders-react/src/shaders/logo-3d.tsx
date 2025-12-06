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
    colorUnderlay: '#83c2c9',
    colorOverlay: '#c36fa1',
    colors: ['#e0992e', '#35bbbb', '#56006b'],
    lightsPower: 0.38,
    bevel: 0.05,
    lightsPos: 242,
  },
};

export const monoPreset: Logo3dPreset = {
  name: 'Mono',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colorUnderlay: '#e3e3e3',
    colorOverlay: '#c2c1c1',
    colors: ['#c2c2c2', '#000000', '#000000'],
    lightsPower: 0.15,
    bevel: 0,
    lightsPos: 82,
  },
};

export const metalPreset: Logo3dPreset = {
  name: 'Metal',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colorUnderlay: '#0a0a0a',
    colorOverlay: '#0f0e16',
    colors: ['#c7c7ff', '#ffbfa3', '#8ffff2'],
    lightsPower: 1.0,
    bevel: 0.7,
    lightsPos: 66,
  },
};
export const flatPreset: Logo3dPreset = {
  name: 'Flat',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colorUnderlay: '#ffbf00',
    colorOverlay: '#35a75e',
    colors: ['#ffffff'],
    lightsPower: 0,
    bevel: 0,
    lightsPos: 62,
  },
};


export const logo3dPresets: Logo3dPreset[] = [defaultPreset, monoPreset, metalPreset, flatPreset];

export const Logo3d: React.FC<Logo3dProps> = memo(function Logo3dImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorUnderlay = defaultPreset.params.colorUnderlay,
  colorOverlay = defaultPreset.params.colorOverlay,
  colors = defaultPreset.params.colors,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  lightsPower = defaultPreset.params.lightsPower,
  bevel = defaultPreset.params.bevel,
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
    u_colorUnderlay: getShaderColorFromString(colorUnderlay),
    u_colorOverlay: getShaderColorFromString(colorOverlay),
    u_image: processedImage,
    u_lightsPower: lightsPower,
    u_lightsPos: lightsPos,
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
