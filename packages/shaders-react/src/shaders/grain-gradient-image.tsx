import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  getShaderNoiseTexture,
  grainGradientImageFragmentShader,
  ShaderFitOptions,
  type GrainGradientImageUniforms,
  type GrainGradientImageParams,
  type ImageShaderPreset,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface GrainGradientImageProps extends ShaderComponentProps, GrainGradientImageParams {}

type GrainGradientImagePreset = ImageShaderPreset<GrainGradientImageParams>;

export const defaultPreset: GrainGradientImagePreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 1,
    frame: 0,
    intensity: 0.5,
    grainSize: 0.5,
  },
};

export const grainGradientImagePresets: GrainGradientImagePreset[] = [defaultPreset];

export const GrainGradientImage: React.FC<GrainGradientImageProps> = memo(function GrainGradientImageImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  intensity = defaultPreset.params.intensity,
  grainSize = defaultPreset.params.grainSize,
  image = '',

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
}: GrainGradientImageProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_intensity: intensity,
    u_grainSize: grainSize,
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
  } satisfies GrainGradientImageUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={grainGradientImageFragmentShader}
      uniforms={uniforms}
    />
  );
});
