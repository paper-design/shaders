import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  getShaderColorFromString,
  liquidMetalFragmentShader,
  ShaderFitOptions,
  type LiquidMetalUniforms,
  type LiquidMetalParams,
  type ShaderPreset,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface LiquidMetalProps extends ShaderComponentProps, LiquidMetalParams {}

type LiquidMetalPreset = ShaderPreset<LiquidMetalParams>;

export const defaultPreset: LiquidMetalPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    patternBlur: 0.005,
    patternScale: 3,
    dispersion: 0.015,
    liquid: 0.07,
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
  patternBlur = defaultPreset.params.patternBlur,
  patternScale = defaultPreset.params.patternScale,
  dispersion = defaultPreset.params.dispersion,
  liquid = defaultPreset.params.liquid,
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
    u_patternBlur: patternBlur,
    u_patternScale: patternScale,
    u_dispersion: dispersion,
    u_liquid: liquid,
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
