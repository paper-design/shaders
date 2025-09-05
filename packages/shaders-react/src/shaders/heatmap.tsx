import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import React, { memo, useLayoutEffect, useMemo, useState } from 'react';
import {
  type HeatmapParams,
  type HeatmapUniforms,
  ShaderFitOptions,
  type ShaderPreset,
  defaultObjectSizing,
  heatmapFragSource,
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
    customParam: 0.5,
    customParamScd: 1,
    frame: 0,
    speed: 1,
    image: 'https://workers.paper-staging.dev/file-assets/01K44QHJ96H7WP54KYYY9VPJHJ/01K4BPJWG3CVFWG7NSR3E7Q0EE.svg',
  },
} as const satisfies HeatmapPreset;

export const heatmapPresets: HeatmapPreset[] = [defaultPreset];

export const Heatmap: React.FC<HeatmapProps> = memo(function HeatmapImpl({
  customParam = defaultPreset.params.customParam,
  customParamScd = defaultPreset.params.customParamScd,
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
      u_customParam: customParam,
      u_customParamScd: customParamScd,
      u_image: processedImage,
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
      customParam,
      customParamScd,
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

  return <ShaderMount {...props} fragmentShader={heatmapFragSource} uniforms={uniforms} />;
});
