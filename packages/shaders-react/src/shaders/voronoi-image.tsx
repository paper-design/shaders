import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  voronoiImageFragmentShader,
  ShaderFitOptions,
  type VoronoiImageParams,
  type VoronoiImageUniforms,
  type ImageShaderPreset,
} from '@paper-design/shaders';

export interface VoronoiImageProps extends ShaderComponentProps, VoronoiImageParams {}

type VoronoiImagePreset = ImageShaderPreset<VoronoiImageParams>;

export const defaultPreset: VoronoiImagePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    speed: 1,
    frame: 0,
    colorGap: '#b5b5b5',
    gridScale: 0.85,
    distortion: 0.4,
    gap: 0.1,
    scale: 1,
  },
};

export const voronoiImagePresets: VoronoiImagePreset[] = [defaultPreset];

export const VoronoiImage: React.FC<VoronoiImageProps> = memo(function VoronoiImageImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  colorGap = defaultPreset.params.colorGap,
  gridScale = defaultPreset.params.gridScale,
  distortion = defaultPreset.params.distortion,
  gap = defaultPreset.params.gap,

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
}: VoronoiImageProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorGap: getShaderColorFromString(colorGap),
    u_gridScale: gridScale,
    u_distortion: distortion,
    u_gap: gap,
    u_noiseTexture: getShaderNoiseTexture(),

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
  } satisfies VoronoiImageUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={voronoiImageFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
