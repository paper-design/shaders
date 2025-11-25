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
    colorBack: '#ffffff00',
    colorInner: '#000000',
    colors: ['#000000', '#ffffff'],
    stripeWidth: 0.65,
    alphaMask: true,
    noiseScale: 1,
    size: 10,
    shift: 0.5,
    noise: 0.5,
    outerNoise: 0.5,
    softness: 0,
    gradient: 1,
    angle: 220,
  },
};

export const fstPreset: FoldsPreset = {
  name: '1',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 0.2,
    frame: 0,
    colorBack: '#000000',
    colorInner: '#00000000',
    colors: ['#ffffff'],
    stripeWidth: 1,
    alphaMask: false,
    noiseScale: 0.5,
    size: 16,
    shift: 0.5,
    noise: 0.32,
    outerNoise: 0,
    softness: 0,
    gradient: 0,
    angle: 0,
  },
};

export const scdPreset: FoldsPreset = {
  name: '2',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 0.2,
    frame: 0,
    colorBack: '#000000',
    colorInner: '#00000000',
    colors: ['#ffffff', '#000000', '#0022ff', '#ffe500'],
    stripeWidth: 0.6,
    alphaMask: false,
    noiseScale: 1.5,
    size: 24,
    shift: 0,
    noise: 0.65,
    outerNoise: 1,
    softness: 0,
    gradient: 1,
    angle: 90,
  },
};

export const trdPreset: FoldsPreset = {
  name: '3',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 0.2,
    frame: 0,
    colorBack: '#000000',
    colorInner: '#6e535354',
    colors: ['#ff5ec4', '#5effc8', '#ffe45e', '#ff6b5e'],
    stripeWidth: 0.3,
    alphaMask: true,
    noiseScale: 1,
    size: 45,
    shift: 0,
    noise: 0.3,
    outerNoise: 0,
    softness: 0,
    gradient: 0,
    angle: 0,
  },
};

export const frtPreset: FoldsPreset = {
  name: '4',
  params: {
    ...defaultObjectSizing,
    scale: 0.8,
    speed: 0.2,
    frame: 0,
    colorBack: '#ffffff',
    colorInner: '#ffffff',
    colors: ['#000000'],
    stripeWidth: 0,
    alphaMask: false,
    noiseScale: 1,
    size: 45,
    shift: 0,
    noise: 0.3,
    outerNoise: 0,
    softness: 0,
    gradient: 0,
    angle: 0,
  },
};

export const ffsPreset: FoldsPreset = {
  name: '5',
  params: {
    ...defaultObjectSizing,
    frame: 0,
    colors: [
      '#ffed47',
      '#ffed47',
      '#31fcb8',
      '#ffffff',
      '#ff006a',
      '#3399cc',
      '#3333cc',
    ],
    colorBack: '#ffffff00',
    colorInner: '#000000',
    stripeWidth: 1.0,
    softness: 0.37,
    gradient: 1.0,
    alphaMask: true,
    size: 3.0,
    shift: -0.37,
    noise: 0.46,
    noiseScale: 1.0,
    outerNoise: 0.0,
    angle: 220,
    speed: 0.20,
    scale: 0.8,
  },
};

export const sixPreset: FoldsPreset = {
  name: '6',
  params: {
    ...defaultObjectSizing,
    frame: 0,
    colors: [
      '#000000'
    ],
    colorBack: '#000000',
    colorInner: '#ffffff',

    stripeWidth: 0.57,
    softness: 0.0,
    gradient: 0.0,
    alphaMask: true,

    size: 18.0,
    shift: -0.50,
    noise: 0.61,
    noiseScale: 1.07,
    outerNoise: 0.0,

    angle: 0,
    speed: 0.20,
    scale: 0.8,
  },
};

export const foldsPresets: FoldsPreset[] = [defaultPreset, fstPreset, scdPreset, trdPreset, frtPreset, ffsPreset, sixPreset];

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
  softness = defaultPreset.params.softness,
  gradient = defaultPreset.params.gradient,
  stripeWidth = defaultPreset.params.stripeWidth,
  alphaMask = defaultPreset.params.alphaMask,
  noiseScale = defaultPreset.params.noiseScale,
  size = defaultPreset.params.size,
  angle = defaultPreset.params.angle,
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
    u_softness: softness,
    u_gradient: gradient,
    u_stripeWidth: stripeWidth,
    u_alphaMask: alphaMask,
    u_noiseScale: noiseScale,
    u_size: size,
    u_angle: angle,
    u_isImage: Boolean(image),

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
