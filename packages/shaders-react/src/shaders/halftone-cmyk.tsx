import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  halftoneCmykFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  type HalftoneCmykUniforms,
  type HalftoneCmykParams,
  defaultObjectSizing,
  type ImageShaderPreset,
} from '@paper-design/shaders';

export interface HalftoneCmykProps extends ShaderComponentProps, HalftoneCmykParams {}

type HalftoneCmykPreset = ImageShaderPreset<HalftoneCmykParams>;

export const defaultPreset: HalftoneCmykPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: .8,
    fit: 'contain',
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    size: 0.85,
    radius: .85,
    contrast: 0.8,
    angleC: 15,
    angleM: 75,
    angleY: 0,
    angleK: 45,
    grainSize: 800.0,
    grainMixer: 0.12,
  },
};

export const halftoneCmykPresets: HalftoneCmykPreset[] = [defaultPreset];

export const HalftoneCmyk: React.FC<HalftoneCmykProps> = memo(function HalftoneCmykImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  image = '',
  size = defaultPreset.params.size,
  radius = defaultPreset.params.radius,
  angleC = defaultPreset.params.angleC,
  angleM = defaultPreset.params.angleM,
  angleY = defaultPreset.params.angleY,
  angleK = defaultPreset.params.angleK,
  contrast = defaultPreset.params.contrast,
  grainSize = defaultPreset.params.grainSize,
  grainMixer = defaultPreset.params.grainMixer,

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
}: HalftoneCmykProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorBack: getShaderColorFromString(colorBack),
    u_size: size,
    u_radius: radius,
    u_angleC: angleC,
    u_angleM: angleM,
    u_angleY: angleY,
    u_angleK: angleK,
    u_contrast: contrast,
    u_grainSize: grainSize,
    u_grainMixer: grainMixer,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_rotation: rotation,
    u_scale: scale,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies HalftoneCmykUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={halftoneCmykFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
