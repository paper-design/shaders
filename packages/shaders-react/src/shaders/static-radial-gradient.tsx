import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  staticRadialGradientFragmentShader,
  ShaderFitOptions,
  type StaticRadialGradientParams,
  type StaticRadialGradientUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface StaticRadialGradientProps extends ShaderComponentProps, StaticRadialGradientParams {}

type StaticRadialGradientPreset = ShaderPreset<StaticRadialGradientParams>;

export const defaultPreset: StaticRadialGradientPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.95,
    speed: 1,
    frame: 0,
    // colorBack: '#020406',
    colors: ['#000000', '#00ff80', '#ffcc00', '#ea00ff'],
    grainMixer: 0.4,
    grainOverlay: 0.4,
    falloff: 1,
    grainScale: 1,
    mixing: 0.7,
    focalAngle: 0,
    focalDistance: 0.9,
    // outer: 0.1,
    maskFocalOverflow: false,
  },
};

export const staticRadialGradientPresets: StaticRadialGradientPreset[] = [defaultPreset];

export const StaticRadialGradient: React.FC<StaticRadialGradientProps> = memo(function StaticRadialGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  // colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  grainMixer = defaultPreset.params.grainMixer,
  grainOverlay = defaultPreset.params.grainOverlay,
  grainScale = defaultPreset.params.grainScale,
  falloff = defaultPreset.params.falloff,
  mixing = defaultPreset.params.mixing,
  focalAngle = defaultPreset.params.focalAngle,
  focalDistance = defaultPreset.params.focalDistance,
  // outer = defaultPreset.params.outer,
  maskFocalOverflow = defaultPreset.params.maskFocalOverflow,

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
}: StaticRadialGradientProps) {
  const uniforms = {
    // Own uniforms
    // u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_grainMixer: grainMixer,
    u_grainOverlay: grainOverlay,
    u_falloff: falloff,
    u_grainScale: grainScale,
    u_mixing: mixing,
    u_focalAngle: focalAngle,
    u_focalDistance: focalDistance,
    // u_outer: outer,
    u_maskFocalOverflow: maskFocalOverflow,

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
  } satisfies StaticRadialGradientUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={staticRadialGradientFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
