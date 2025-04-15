import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  smokeRingFragmentShader,
  ShaderFitOptions,
  type ShaderPreset,
  type SmokeRingParams,
  type SmokeRingUniforms,
} from '@paper-design/shaders';

export interface SmokeRingProps extends ShaderComponentProps, SmokeRingParams {}

type SmokeRingPreset = ShaderPreset<SmokeRingParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: SmokeRingPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colorInner: 'hsla(56, 13%, 90%, 1)',
    colorOuter: 'hsla(56, 16%, 75%, 1)',
    noiseScale: 3,
    noiseIterations: 10,
    radius: 0.5,
    thickness: 0.25,
    innerShape: 1,
  },
};

export const poisonPreset: SmokeRingPreset = {
  name: 'Poison',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colorInner: 'hsla(61, 100%, 50%, 1)',
    colorOuter: 'hsla(111, 89%, 27%, 1)',
    noiseScale: 2.2,
    noiseIterations: 10,
    radius: 0.4,
    thickness: 0.2,
    innerShape: 0.6,
  },
};

export const linePreset: SmokeRingPreset = {
  name: 'Line',
  params: {
    ...defaultObjectSizing,
    frame: 0,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colorInner: 'hsla(185, 100%, 56%, 1)',
    colorOuter: 'hsla(251, 39%, 45%, 1)',
    noiseScale: 1.1,
    noiseIterations: 2,
    radius: 0.38,
    thickness: 0.01,
    innerShape: 0.88,
    speed: 4,
  },
};

export const cloudPreset: SmokeRingPreset = {
  name: 'Cloud',
  params: {
    ...defaultObjectSizing,
    frame: 0,
    colorBack: 'hsla(218, 100%, 62%, 1)',
    colorInner: 'hsla(0, 0%, 100%, 1)',
    colorOuter: 'hsla(0, 0%, 100%, 1)',
    noiseScale: 1.5,
    noiseIterations: 10,
    radius: 0.5,
    thickness: 0.65,
    innerShape: 0.9,
    speed: 0.5,
  },
};

export const smokeRingPresets: SmokeRingPreset[] = [defaultPreset, linePreset, poisonPreset, cloudPreset];

export const SmokeRing: React.FC<SmokeRingProps> = memo(function SmokeRingImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorInner = defaultPreset.params.colorInner,
  colorOuter = defaultPreset.params.colorOuter,
  noiseScale = defaultPreset.params.noiseScale,
  thickness = defaultPreset.params.thickness,
  radius = defaultPreset.params.radius,
  innerShape = defaultPreset.params.innerShape,
  noiseIterations = defaultPreset.params.noiseIterations,

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
}: SmokeRingProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorInner: getShaderColorFromString(colorInner),
    u_colorOuter: getShaderColorFromString(colorOuter),
    u_noiseScale: noiseScale,
    u_thickness: thickness,
    u_radius: radius,
    u_innerShape: innerShape,
    u_noiseIterations: noiseIterations,

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
  } satisfies SmokeRingUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={smokeRingFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
