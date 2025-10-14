import { memo, useLayoutEffect, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  liquidMetalFragmentShader,
  ShaderFitOptions,
  defaultObjectSizing,
  type LiquidMetalUniforms,
  type LiquidMetalParams,
  toProcessedLiquidMetal,
  type ImageShaderPreset,
  getShaderColorFromString,
  LiquidMetalShapes,
} from '@paper-design/shaders';
import { transparentPixel } from '../transparent-pixel.js';
import { suspend } from '../suspend.js';

export interface LiquidMetalProps extends ShaderComponentProps, LiquidMetalParams {
  /**
   * Suspends the component when the image is being processed.
   */
  suspendWhenProcessingImage?: boolean;
}

type LiquidMetalPreset = ImageShaderPreset<LiquidMetalParams>;

export const defaultPreset: LiquidMetalPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 1,
    frame: 0,
    colorBack: '#00000000',
    colorTint: '#ffffff',
    distortion: 0.3,
    repetition: 2.0,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    contour: 0.4,
    softness: 0.1,
    shape: 'metaballs',
  },
};

export const bluePreset: LiquidMetalPreset = {
  name: 'Blue',
  params: {
    ...defaultObjectSizing,
    scale: 1.8,
    speed: 1,
    frame: 0,
    colorBack: '#00042e',
    colorTint: '#5b4dc7',
    softness: 0.45,
    repetition: 4,
    shiftRed: -0.5,
    shiftBlue: -1,
    distortion: 0.1,
    contour: 0,
    shape: 'metaballs',
  },
};

export const containedPreset: LiquidMetalPreset = {
  name: 'Contained',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#ffffff00',
    colorTint: '#ffffff',
    softness: 0.05,
    repetition: 2,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    distortion: 0.1,
    contour: 0,
    shape: 'none',
    worldWidth: 0,
    worldHeight: 0,
  },
};

export const sepiaPreset: LiquidMetalPreset = {
  name: 'Sepia',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    scale: 0.8,
    colorBack: '#222222',
    colorTint: '#fffa66',
    softness: 0.4,
    repetition: 2,
    shiftRed: 1,
    shiftBlue: 0.3,
    distortion: 0.4,
    contour: 0,
    shape: 'circle',
    worldWidth: 0,
    worldHeight: 0,
  },
};


export const liquidMetalPresets: LiquidMetalPreset[] = [defaultPreset, bluePreset, containedPreset, sepiaPreset];

export const LiquidMetal: React.FC<LiquidMetalProps> = memo(function LiquidMetalImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorTint = defaultPreset.params.colorTint,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  contour = defaultPreset.params.contour,
  distortion = defaultPreset.params.distortion,
  softness = defaultPreset.params.softness,
  repetition = defaultPreset.params.repetition,
  shiftRed = defaultPreset.params.shiftRed,
  shiftBlue = defaultPreset.params.shiftBlue,
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
}: LiquidMetalProps) {
  const imageUrl = typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  if (suspendWhenProcessingImage && typeof window !== 'undefined' && imageUrl) {
    processedImage = suspend(
      (): Promise<string> => toProcessedLiquidMetal(imageUrl).then((result) => URL.createObjectURL(result.pngBlob)),
      [imageUrl, 'liquid-metal']
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

    toProcessedLiquidMetal(imageUrl).then((result) => {
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
    u_colorTint: getShaderColorFromString(colorTint),

    u_image: processedImage,
    u_contour: contour,
    u_distortion: distortion,
    u_softness: softness,
    u_repetition: repetition,
    u_shiftRed: shiftRed,
    u_shiftBlue: shiftBlue,
    u_isImage: Boolean(image),
    u_shape: LiquidMetalShapes[shape],

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
  } satisfies LiquidMetalUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={liquidMetalFragmentShader}
      uniforms={uniforms}
    />
  );
});
