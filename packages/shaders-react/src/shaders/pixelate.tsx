import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  pixelateFragmentShader,
  ShaderFitOptions,
  type PixelateUniforms,
  type PixelateParams,
  type ShaderPreset,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface PixelateProps extends ShaderComponentProps, PixelateParams {}

type PixelatePreset = ShaderPreset<PixelateParams>;

export const defaultPreset: PixelatePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    worldWidth: 0,
    worldHeight: 0,
    speed: 0,
    frame: 0,
    image: '/images/010.png',
    sizeX: 20,
    sizeY: 20,
  },
};

export const pixelatePresets: PixelatePreset[] = [defaultPreset];

export const Pixelate: React.FC<PixelateProps> = memo(function PixelateImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = defaultPreset.params.image,
  sizeX = defaultPreset.params.sizeX,
  sizeY = defaultPreset.params.sizeY,

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
}: PixelateProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_size_x: sizeX,
    u_size_y: sizeY,

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
  } satisfies PixelateUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={pixelateFragmentShader} uniforms={uniforms} />
  );
});
