import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
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
    scale: 1.5,
    speed: 0.6,
    frame: 0,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colors: ['hsla(350, 90%, 55%, 1)', 'hsla(200, 80%, 60%, 1)'],
    roundness: 0.5,
    thickness: 0.02,
    softness: 0.5,
    intensity: 2.4,
    spotsNumber: 4,
    spotSize: 0.15,
    pulsing: 0,
    smoke: 1,
  },
};

export const pulsingBorderPresets: PulsingBorderPreset[] = [defaultPreset];

export const PulsingBorder: React.FC<PulsingBorderProps> = memo(function PulsingBorderImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  colorBack = defaultPreset.params.colorBack,
  roundness = defaultPreset.params.roundness,
  thickness = defaultPreset.params.thickness,
  softness = defaultPreset.params.softness,
  intensity = defaultPreset.params.intensity,
  spotsNumber = defaultPreset.params.spotsNumber,
  spotSize = defaultPreset.params.spotSize,
  pulsing = defaultPreset.params.pulsing,
  smoke = defaultPreset.params.smoke,

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
  const simplexNoiseTexture = typeof window !== 'undefined' && { u_simplexNoiseTexture: getShaderNoiseTexture(3) };
  const pulseTexture = typeof window !== 'undefined' && { u_pulseTexture: getShaderNoiseTexture(1) };
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_roundness: roundness,
    u_thickness: thickness,
    u_softness: softness,
    u_intensity: intensity,
    u_spotsNumber: spotsNumber,
    u_spotSize: spotSize,
    u_pulsing: pulsing,
    u_smoke: smoke,
    ...pulseTexture,
    ...simplexNoiseTexture,

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
