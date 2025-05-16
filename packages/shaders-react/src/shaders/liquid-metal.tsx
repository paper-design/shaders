import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  liquidMetalFragmentShader,
  ShaderFitOptions,
  type LiquidMetalUniforms,
  type LiquidMetalParams,
  type ShaderPreset,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface LiquidMetalProps extends ShaderComponentProps, LiquidMetalParams {}

type LiquidMetalPreset = ShaderPreset<LiquidMetalParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: LiquidMetalPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    softness: 0.05,
    repetition: 3,
    dispersion: 0.3,
    distortion: 0.07,
    shape: 0,
    worldWidth: 0,
    worldHeight: 0,
  },
};

export const liquidMetalPresets: LiquidMetalPreset[] = [defaultPreset];

export const LiquidMetal: React.FC<LiquidMetalProps> = memo(function LiquidMetalImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  softness = defaultPreset.params.softness,
  repetition = defaultPreset.params.repetition,
  dispersion = defaultPreset.params.dispersion,
  distortion = defaultPreset.params.distortion,
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
    u_softness: softness,
    u_repetition: repetition,
    u_dispersion: dispersion,
    u_distortion: distortion,
    u_shape: shape,

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
