'use client';

// The paper-texture as published in @paper-design/shaders 0.0.79 — the last release before the
// rework, and what main still holds. Mounted with the current ShaderMount, which only supplies
// v_imageUV, u_resolution and u_pixelRatio to the old fragment shader.
// Temporary, delete with the migration page.

import { ShaderMount } from '@paper-design/shaders-react';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  paperTextureFragmentShader,
  ShaderFitOptions,
} from 'shaders-old';

export type OldParams = typeof oldDefaultParams;

export const oldDefaultParams = {
  ...defaultObjectSizing,
  fit: 'cover' as const,
  scale: 0.6,
  colorFront: '#9fadbc',
  colorBack: '#ffffff',
  contrast: 0.3,
  roughness: 0.4,
  fiber: 0.3,
  fiberSize: 0.2,
  crumples: 0.3,
  crumpleSize: 0.35,
  folds: 0.65,
  foldCount: 5,
  fade: 0,
  drops: 0.2,
  seed: 5.8,
};

export function OldPaperTexture({
  params = oldDefaultParams,
  image = '',
  style,
}: {
  params?: OldParams;
  image?: string;
  style?: React.CSSProperties;
}) {
  const p = params;
  const noiseTexture = typeof window !== 'undefined' && { u_noiseTexture: getShaderNoiseTexture() };

  return (
    <ShaderMount
      style={style}
      fragmentShader={paperTextureFragmentShader}
      uniforms={{
        u_image: image,
        u_colorFront: getShaderColorFromString(p.colorFront),
        u_colorBack: getShaderColorFromString(p.colorBack),
        u_contrast: p.contrast,
        u_roughness: p.roughness,
        u_fiber: p.fiber,
        u_fiberSize: p.fiberSize,
        u_crumples: p.crumples,
        u_crumpleSize: p.crumpleSize,
        u_foldCount: p.foldCount,
        u_folds: p.folds,
        u_fade: p.fade,
        u_drops: p.drops,
        u_seed: p.seed,
        ...noiseTexture,

        u_fit: ShaderFitOptions[p.fit],
        u_scale: p.scale,
        u_rotation: p.rotation,
        u_offsetX: p.offsetX,
        u_offsetY: p.offsetY,
        u_originX: p.originX,
        u_originY: p.originY,
        u_worldWidth: p.worldWidth,
        u_worldHeight: p.worldHeight,
      }}
    />
  );
}
