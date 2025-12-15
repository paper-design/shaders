import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  gemSmokeFragmentShader,
  ShaderFitOptions,
  defaultObjectSizing,
  type GemSmokeUniforms,
  type GemSmokeParams,
  toProcessedGemSmoke,
  type ImageShaderPreset,
  getShaderColorFromString,
} from '@paper-design/shaders';
import { transparentPixel } from '../transparent-pixel.js';
import { suspend } from '../suspend.js';

export interface GemSmokeProps extends ShaderComponentProps, GemSmokeParams {
  /**
   * Suspends the component when the image is being processed.
   */
  suspendWhenProcessingImage?: boolean;
}

type GemSmokePreset = ImageShaderPreset<GemSmokeParams>;

export const defaultPreset: GemSmokePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.65,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colors: ['#1d1e4e', '#00b2ff', '#bf5fff', '#ff8800', '#fff8e0'],
    outerVisibility: 0.4,
    distortion: 0.85,
    innerFill: 0,
    outerDistortion: 1,
    angle: 0,
    size: 0.5,
  },
};

export const blackPreset: GemSmokePreset = {
  name: 'Black',
  params: {
    ...defaultObjectSizing,
    scale: 0.65,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colors: ['#000000', '#000000', '#ffffff'],
    outerVisibility: 0.5,
    distortion: 1,
    innerFill: 0,
    outerDistortion: 0.8,
    angle: 180,
    size: 0.5,
  },
};

export const innerPreset: GemSmokePreset = {
  name: 'Inner',
  params: {
    ...defaultObjectSizing,
    scale: 0.65,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#00ff2f', '#f7ff61', '#ffffff'],
    outerVisibility: 0,
    distortion: 1,
    innerFill: 0,
    outerDistortion: 0.8,
    angle: 0,
    size: 0.5,
  },
};

export const brightPreset: GemSmokePreset = {
  name: 'Bright',
  params: {
    ...defaultObjectSizing,
    scale: 0.65,
    speed: 0.5,
    frame: 0,
    colorBack: '#aa00b3',
    colors: ['#ff9900', '#fff67a', '#89f5bc', '#dcff52', '#05eaff'],
    outerVisibility: 0.9,
    distortion: 1,
    innerFill: 0,
    outerDistortion: 1,
    angle: 0,
    size: 1,
  },
};

export const gemSmokePresets: GemSmokePreset[] = [defaultPreset, blackPreset, innerPreset, brightPreset];

export const GemSmoke: React.FC<GemSmokeProps> = memo(function GemSmokeImpl({
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
  angle = defaultPreset.params.angle,
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
}: GemSmokeProps) {
  const imageUrl = typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  if (suspendWhenProcessingImage && typeof window !== 'undefined' && imageUrl) {
    processedImage = suspend(
      (): Promise<string> => toProcessedGemSmoke(imageUrl).then((result) => URL.createObjectURL(result.pngBlob)),
      [imageUrl, 'gemSmoke']
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

    toProcessedGemSmoke(imageUrl).then((result) => {
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
    u_angle: angle,
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
  } satisfies GemSmokeUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={gemSmokeFragmentShader}
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
