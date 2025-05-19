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
  getShaderColorFromString,
  LiquidMetalShapes,
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
    softness: 0.3,
    repetition: 3,
    rDispersion: 0.3,
    bDispersion: 0.3,
    distortion: 0.07,
    contour: 0,
    shape: 'none',
    worldWidth: 0,
    worldHeight: 0,
    color1: 'hsla(0, 0%, 100%, 1)',
    color2: 'hsla(225, 75%, 24%, 1)',
  },
};

export const liquidMetalPresets: LiquidMetalPreset[] = [defaultPreset];

export const LiquidMetal: React.FC<LiquidMetalProps> = memo(function LiquidMetalImpl({
  // Own props
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  softness = defaultPreset.params.softness,
  repetition = defaultPreset.params.repetition,
  rDispersion = defaultPreset.params.rDispersion,
  bDispersion = defaultPreset.params.bDispersion,
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
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),

    u_softness: softness,
    u_repetition: repetition,
    u_rDispersion: rDispersion,
    u_bDispersion: bDispersion,
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
