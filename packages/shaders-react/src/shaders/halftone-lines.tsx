import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  halftoneLinesFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  type HalftoneLinesUniforms,
  type HalftoneLinesParams,
  defaultObjectSizing,
  type ImageShaderPreset,
} from '@paper-design/shaders';

export interface HalftoneLinesProps extends ShaderComponentProps, HalftoneLinesParams {}
type HalftoneLinesPreset = ImageShaderPreset<HalftoneLinesParams>;

export const defaultPreset: HalftoneLinesPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#615681',
    colorFront: '#ffffff',
    stripeWidth: 0,
    smoothness: 10,
    size: 40,
    angleDistortion: 0.4,
    noiseDistortion: 0,
    angle: 0,
    contrast: 0.7,
    originalColors: false,
    inverted: false,
    grainMixer: 0.2,
    grainOverlay: 0.2,
  },
};

export const classicPreset: HalftoneLinesPreset = {
  name: 'Classic',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    colorFront: '#000000',
    stripeWidth: 1,
    smoothness: 10,
    size: 60,
    angleDistortion: 0,
    noiseDistortion: 0,
    angle: 0,
    contrast: 0.7,
    originalColors: false,
    inverted: false,
    grainMixer: 0,
    grainOverlay: 0,
  },
};

export const halftoneLinesPresets: HalftoneLinesPreset[] = [defaultPreset, classicPreset];

export const HalftoneLines: React.FC<HalftoneLinesProps> = memo(function HalftoneLinesImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorFront = defaultPreset.params.colorFront,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = '',
  angleDistortion = defaultPreset.params.angleDistortion,
  noiseDistortion = defaultPreset.params.noiseDistortion,
  stripeWidth = defaultPreset.params.stripeWidth,
  smoothness = defaultPreset.params.smoothness,
  size = defaultPreset.params.size,
  angle = defaultPreset.params.angle,
  contrast = defaultPreset.params.contrast,
  originalColors = defaultPreset.params.originalColors,
  inverted = defaultPreset.params.inverted,
  grainMixer = defaultPreset.params.grainMixer,
  grainOverlay = defaultPreset.params.grainOverlay,

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
}: HalftoneLinesProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFront: getShaderColorFromString(colorFront),

    u_image: image,
    u_angleDistortion: angleDistortion,
    u_noiseDistortion: noiseDistortion,
    u_stripeWidth: stripeWidth,
    u_smoothness: smoothness,
    u_size: size,
    u_angle: angle,
    u_contrast: contrast,
    u_originalColors: originalColors,
    u_inverted: inverted,
    u_grainMixer: grainMixer,
    u_grainOverlay: grainOverlay,

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
  } satisfies HalftoneLinesUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={halftoneLinesFragmentShader}
      // mipmaps={ ['u_image'] }
      uniforms={uniforms}
    />
  );
});
