import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  liquidMetalFragmentShader,
  ShaderFitOptions,
  type LiquidMetalUniforms,
  type LiquidMetalParams,
  type ShaderPreset,
  defaultObjectSizing,
  getShaderColorFromString,
  LiquidMetalShapes,
} from '@paper-design/shaders';

export interface LiquidMetalProps extends ShaderComponentProps, LiquidMetalParams {}

type LiquidMetalPreset = ShaderPreset<LiquidMetalParams>;

export const defaultPreset: LiquidMetalPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 2.2,
    speed: 1,
    frame: 0,
    colorBack: '#00042e',
    colorTint: '#5b4dc7',
    softness: 0.45,
    repetition: 4,
    shiftRed: -0.5,
    shiftBlue: -1,
    distortion: 0.1,
    contour: 1,
    shape: 'metaballs',
  },
};

export const dropsPreset: LiquidMetalPreset = {
  name: 'Drops',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#ffffff00',
    colorTint: '#ffffff',
    softness: 0.3,
    repetition: 3,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    distortion: 0.3,
    contour: 0.88,
    shape: 'metaballs',
  },
};

export const fullScreenPreset: LiquidMetalPreset = {
  name: 'Full Screen',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#ffffff00',
    colorTint: '#ffffff',
    softness: 0.3,
    repetition: 3,
    shiftRed: 0.3,
    shiftBlue: 0.3,
    distortion: 0.07,
    contour: 0,
    shape: 'none',
    worldWidth: 0,
    worldHeight: 0,
  },
};

export const spherePreset: LiquidMetalPreset = {
  name: 'Sphere',
  params: {
    ...defaultObjectSizing,
    scale: 0.7,
    speed: 2,
    frame: 0,
    colorBack: '#ffffff00',
    colorTint: '#d1e0ff',
    softness: 0.45,
    repetition: 4,
    shiftRed: 1,
    shiftBlue: 0.3,
    distortion: 0.1,
    contour: 0.4,
    shape: 'circle',
  },
};

export const liquidMetalPresets: LiquidMetalPreset[] = [defaultPreset, spherePreset, dropsPreset, fullScreenPreset];

export const LiquidMetal: React.FC<LiquidMetalProps> = memo(function LiquidMetalImpl({
  // Own props
  colorBack = defaultPreset.params.colorBack,
  colorTint = defaultPreset.params.colorTint,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  softness = defaultPreset.params.softness,
  repetition = defaultPreset.params.repetition,
  shiftRed = defaultPreset.params.shiftRed,
  shiftBlue = defaultPreset.params.shiftBlue,
  distortion = defaultPreset.params.distortion,
  contour = defaultPreset.params.contour,
  shape = defaultPreset.params.shape,

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
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorTint: getShaderColorFromString(colorTint),

    u_softness: softness,
    u_repetition: repetition,
    u_shiftRed: shiftRed,
    u_shiftBlue: shiftBlue,
    u_distortion: distortion,
    u_contour: contour,
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
}, colorPropsAreEqual);
