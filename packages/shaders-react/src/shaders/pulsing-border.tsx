import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  pulsingBorderFragmentShader,
  ShaderFitOptions,
  type PulsingBorderParams,
  type PulsingBorderUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface PulsingBorderProps extends ShaderComponentProps, PulsingBorderParams {}

type PulsingBorderPreset = ShaderPreset<PulsingBorderParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: PulsingBorderPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1.4,
    speed: 0.6,
    frame: 0,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    color1: 'hsla(350, 90%, 55%, 1)',
    color2: 'hsla(200, 80%, 60%, 1)',
    radius: 0.5,
    thickness: 0.02,
    softness: 0.5,
    intensity: 0.5,
    spotsNumber: 10,
    pulsing: 0.5,
  },
};

export const pulsingBorderPresets: PulsingBorderPreset[] = [defaultPreset];

export const PulsingBorder: React.FC<PulsingBorderProps> = memo(function PulsingBorderImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  radius = defaultPreset.params.radius,
  thickness = defaultPreset.params.thickness,
  softness = defaultPreset.params.softness,
  intensity = defaultPreset.params.intensity,
  spotsNumber = defaultPreset.params.spotsNumber,
  pulsing = defaultPreset.params.pulsing,

  // Sizing props
  fit = defaultPreset.params.fit,
  rotation = defaultPreset.params.rotation,
  scale = defaultPreset.params.scale,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: PulsingBorderProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_radius: radius,
    u_thickness: thickness,
    u_softness: softness,
    u_intensity: intensity,
    u_spotsNumber: spotsNumber,
    u_pulsing: pulsing,

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
  } satisfies PulsingBorderUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={pulsingBorderFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
