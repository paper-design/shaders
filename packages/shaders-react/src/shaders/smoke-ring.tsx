import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
  smokeRingFragmentShader,
  ShaderFitOptions,
  type ShaderPreset,
  type SmokeRingParams,
  type SmokeRingUniforms,
} from '@paper-design/shaders';

export interface SmokeRingProps extends ShaderComponentProps, SmokeRingParams {}

type SmokeRingPreset = ShaderPreset<SmokeRingParams>;

export const defaultPreset: SmokeRingPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 0.5,
    frame: 0,
    colorBack: '#000000',
    colors: ['#ffffff'],
    noiseScale: 3,
    noiseIterations: 8,
    radius: 0.25,
    thickness: 0.65,
    innerShape: 0.7,
    scale: 0.8,
  },
};

export const solarPreset: SmokeRingPreset = {
  name: 'Solar',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: '#000000',
    colors: ['#ffffff', '#ffca0a', '#fc6203', '#fc620366'],
    noiseScale: 2,
    noiseIterations: 3,
    radius: 0.4,
    thickness: 0.8,
    innerShape: 4,
    scale: 2,
    offsetY: 1,
  },
};

export const linePreset: SmokeRingPreset = {
  name: 'Line',
  params: {
    ...defaultObjectSizing,
    frame: 0,
    colorBack: '#000000',
    colors: ['#4540a4', '#1fe8ff'],
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
    colorBack: '#81ADEC',
    colors: ['#ffffff'],
    noiseScale: 3,
    noiseIterations: 10,
    radius: 0.5,
    thickness: 0.65,
    innerShape: 0.85,
    speed: 0.5,
    scale: 2.5,
  },
};

export const smokeRingPresets: SmokeRingPreset[] = [defaultPreset, linePreset, solarPreset, cloudPreset];

export const SmokeRing: React.FC<SmokeRingProps> = memo(function SmokeRingImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
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
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_noiseScale: noiseScale,
    u_thickness: thickness,
    u_radius: radius,
    u_innerShape: innerShape,
    u_noiseIterations: noiseIterations,
    u_noiseTexture: getShaderNoiseTexture(),

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
