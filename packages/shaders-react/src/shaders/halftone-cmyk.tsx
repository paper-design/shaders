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
  HalftoneCmykTypes,
} from '@paper-design/shaders';

export interface HalftoneCmykProps extends ShaderComponentProps, HalftoneCmykParams {}

type HalftoneCmykPreset = ImageShaderPreset<HalftoneCmykParams>;

export const defaultPreset: HalftoneCmykPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    size: 0.3,
    radius: .7,
    minRadius: .3,
    contrast: 1,
    angleC: 15,
    shiftC: -0.5,
    visibilityC: 1,
    angleM: 75,
    shiftM: -0,
    visibilityM: 1,
    angleY: 0,
    shiftY: 0,
    visibilityY: 1,
    angleK: 45,
    shiftK: 0.5,
    visibilityK: 1,
    softness: 0.3,
    smoothness: 0,
    rounded: true,
    grainSize: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
    type: 'dot',
  },
};

export const naturalPreset: HalftoneCmykPreset = {
  name: 'Natural',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    size: 0.5,
    radius: .85,
    minRadius: .15,
    contrast: 1,
    angleC: 15,
    shiftC: -0.5,
    visibilityC: 1,
    angleM: 75,
    shiftM: -0,
    visibilityM: 1,
    angleY: 0,
    shiftY: 0,
    visibilityY: 1,
    angleK: 45,
    shiftK: 0.5,
    visibilityK: 1,
    softness: 1,
    smoothness: 0,
    rounded: true,
    grainSize: 0.5,
    grainMixer: 0,
    grainOverlay: 0.5,
    type: 'dot',
  },
};

export const largePreset: HalftoneCmykPreset = {
  name: 'Large',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    size: 0.98,
    radius: 0.8,
    minRadius: .15,
    contrast: 1,
    angleC: 15,
    shiftC: -0.5,
    visibilityC: 1,
    angleM: 75,
    shiftM: -0,
    visibilityM: 1,
    angleY: 0,
    shiftY: 0,
    visibilityY: 1,
    angleK: 55,
    shiftK: 0.5,
    visibilityK: 1,
    softness: 0,
    smoothness: 0,
    rounded: false,
    grainSize: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
    type: 'dot',
  },
};

export const strokesPreset: HalftoneCmykPreset = {
  name: 'Strokes',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    fit: 'contain',
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    size: 0.84,
    radius: 1,
    minRadius: 0,
    contrast: 1,
    angleC: 15,
    shiftC: -0.5,
    visibilityC: 1,
    angleM: 75,
    shiftM: -0,
    visibilityM: 1,
    angleY: 0,
    shiftY: 0,
    visibilityY: 1,
    angleK: 45,
    shiftK: 0.5,
    visibilityK: 1,
    softness: 0,
    smoothness: 0,
    rounded: false,
    grainSize: 0.5,
    grainMixer: 0,
    grainOverlay: 0,
    type: 'line',
  },
};

export const halftoneCmykPresets: HalftoneCmykPreset[] = [defaultPreset, naturalPreset, largePreset, strokesPreset];

export const HalftoneCmyk: React.FC<HalftoneCmykProps> = memo(function HalftoneCmykImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  image = '',
  size = defaultPreset.params.size,
  radius = defaultPreset.params.radius,
  minRadius = defaultPreset.params.minRadius,
  angleC = defaultPreset.params.angleC,
  angleM = defaultPreset.params.angleM,
  angleY = defaultPreset.params.angleY,
  angleK = defaultPreset.params.angleK,
  shiftC = defaultPreset.params.shiftC,
  shiftM = defaultPreset.params.shiftM,
  shiftY = defaultPreset.params.shiftY,
  shiftK = defaultPreset.params.shiftK,
  visibilityC = defaultPreset.params.visibilityC,
  visibilityM = defaultPreset.params.visibilityM,
  visibilityY = defaultPreset.params.visibilityY,
  visibilityK = defaultPreset.params.visibilityK,
  contrast = defaultPreset.params.contrast,
  smoothness = defaultPreset.params.smoothness,
  softness = defaultPreset.params.softness,
  rounded = defaultPreset.params.rounded,
  grainSize = defaultPreset.params.grainSize,
  grainMixer = defaultPreset.params.grainMixer,
  grainOverlay = defaultPreset.params.grainOverlay,
  type = defaultPreset.params.type,

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
    u_minRadius: minRadius,
    u_angleC: angleC,
    u_angleM: angleM,
    u_angleY: angleY,
    u_angleK: angleK,
    u_shiftC: shiftC,
    u_shiftM: shiftM,
    u_shiftY: shiftY,
    u_shiftK: shiftK,
    u_visibilityC: visibilityC,
    u_visibilityM: visibilityM,
    u_visibilityY: visibilityY,
    u_visibilityK: visibilityK,
    u_contrast: contrast,
    u_smoothness: smoothness,
    u_softness: softness,
    u_rounded: rounded,
    u_grainSize: grainSize,
    u_grainMixer: grainMixer,
    u_grainOverlay: grainOverlay,
    u_type: HalftoneCmykTypes[type],

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
