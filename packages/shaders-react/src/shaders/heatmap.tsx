import React, { memo, useLayoutEffect, useMemo, useState } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  getShaderColorFromString,
  heatmapFragmentShader,
  ShaderFitOptions,
  type HeatmapUniforms,
  type HeatmapParams,
  type ShaderPreset,
  defaultObjectSizing,
  toProcessedHeatmap,
} from '@paper-design/shaders';

import { preload } from 'react-dom';
import { transparentPixel } from '../transparent-pixel.js';

export interface HeatmapProps extends ShaderComponentProps, HeatmapParams {}

export type HeatmapPreset = ShaderPreset<HeatmapParams>;

export const defaultPreset: HeatmapPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    image: './heatmap-temporary/logo-pics/apple.svg',
    contour: 0.5,
    angle: 0,
    proportion: 0.5,
    noise: 0,
    inner: 0.5,
    outer: 0.5,
    colorBack: '#000000',
    colors: ['#11206a', '#1f3ba2', '#2f63e7', '#6bd7ff', '#ffe679', '#ff991e', '#ff4c00'],
  },
} as const satisfies HeatmapPreset;

export const heatmapPresets: HeatmapPreset[] = [defaultPreset];

export const Heatmap: React.FC<HeatmapProps> = memo(function HeatmapImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  contour = defaultPreset.params.contour,
  angle = defaultPreset.params.angle,
  proportion = defaultPreset.params.proportion,
  noise = defaultPreset.params.noise,
  inner = defaultPreset.params.inner,
  outer = defaultPreset.params.outer,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,

  // Sizing props
  fit = defaultPreset.params.fit,
  image = transparentPixel,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  rotation = defaultPreset.params.rotation,
  scale = defaultPreset.params.scale,
  worldHeight = defaultPreset.params.worldHeight,
  worldWidth = defaultPreset.params.worldWidth,
  ...props
}: HeatmapProps) {
  const [processedImage, setProcessedImage] = useState<string>(transparentPixel);

  const imageUrl = typeof image === 'string' ? image : image.src;
  preload(imageUrl, { as: 'image', crossOrigin: 'anonymous', fetchPriority: 'high' });

  useLayoutEffect(() => {
    if (!imageUrl) {
      setProcessedImage(transparentPixel);
      return;
    }

    let url: string;
    let current = true;

    toProcessedHeatmap(imageUrl).then((result) => {
      if (current) {
        url = URL.createObjectURL(result.blob);
        setProcessedImage(url);
      }
    });

    return () => {
      current = false;
      URL.revokeObjectURL(url);
    };
  }, [imageUrl]);

  const uniforms = useMemo(
    () => ({
      // Own uniforms
      u_image: processedImage,
      u_contour: contour,
      u_angle: angle,
      u_proportion: proportion,
      u_noise: noise,
      u_inner: inner,
      u_outer: outer,
      u_colorBack: getShaderColorFromString(colorBack),
      u_colors: colors.map(getShaderColorFromString),
      u_colorsCount: colors.length,

      // Sizing uniforms
      u_fit: ShaderFitOptions[fit],
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_rotation: rotation,
      u_scale: scale,
      u_worldHeight: worldHeight,
      u_worldWidth: worldWidth,
    }),
    [
      speed,
      frame,
      contour,
      angle,
      proportion,
      noise,
      inner,
      outer,
      colors,
      colorBack,
      processedImage,
      fit,
      offsetX,
      offsetY,
      originX,
      originY,
      rotation,
      scale,
      worldHeight,
      worldWidth,
    ]
  ) satisfies HeatmapUniforms;

  return <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={heatmapFragmentShader} uniforms={uniforms} />;
});
