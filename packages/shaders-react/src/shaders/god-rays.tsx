import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultObjectSizing,
  // getShaderNoiseTexture,
  getShaderColorFromString,
  godRaysFragmentShader,
  ShaderFitOptions,
  type GodRaysParams,
  type GodRaysUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface GodRaysProps extends ShaderComponentProps, GodRaysParams {}

type GodRaysPreset = ShaderPreset<GodRaysParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highmidIntensity bug)

export const defaultPreset: GodRaysPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    offsetX: 0,
    offsetY: 0,
    colorBack: 'hsla(215, 100%, 11%, 1)',
    colors: ['hsla(45, 100%, 70%, 1)', 'hsla(10, 100%, 80%, 1)', 'hsla(178, 100%, 83%, 1)'],
    frequency: 6,
    spotty: 0.28,
    midIntensity: 1,
    midSize: 3,
    density: 0.3,
    blending: 0,
    speed: 1,
    frame: 0,
  },
};

export const auroraPreset: GodRaysPreset = {
  name: 'Aurora',
  params: {
    ...defaultObjectSizing,
    offsetY: 1,
    colorBack: 'hsla(0, 0%, 25%, 1)',
    colors: ['hsla(239, 100%, 70%, 1)', 'hsla(150, 100%, 70%, 1)', 'hsla(200, 100%, 70%, 1)'],
    frequency: 2.4,
    spotty: 0.9,
    midIntensity: 0.8,
    midSize: 2.1,
    density: 0.5,
    blending: 1,
    speed: 0.5,
    frame: 0,
  },
};

export const warpPreset: GodRaysPreset = {
  name: 'Warp',
  params: {
    ...defaultObjectSizing,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colors: ['hsla(317, 100%, 50%, 1)', 'hsla(25, 100%, 50%, 1)', 'hsla(0, 0%, 100%, 1)'],
    frequency: 1.2,
    spotty: 0.15,
    midIntensity: 0,
    midSize: 0,
    density: 0.79,
    blending: 0.4,
    speed: 2,
    frame: 0,
  },
};

export const linearPreset: GodRaysPreset = {
  name: 'Linear',
  params: {
    ...defaultObjectSizing,
    offsetX: 0.2,
    offsetY: -0.7,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colors: ['hsl(0 0% 100% / 12%)', 'hsl(0 0% 100% / 24%)', 'hsl(0 0% 100% / 16%)'],
    frequency: 1.2,
    spotty: 0.25,
    midSize: 1.1,
    midIntensity: 0.75,
    density: 0.79,
    blending: 1,
    speed: 0.5,
    frame: 0,
  },
};

export const etherPreset: GodRaysPreset = {
  name: 'Ether',
  params: {
    ...defaultObjectSizing,
    offsetX: -0.6,
    colorBack: 'hsl(226.7 50% 7.1% / 100%)',
    colors: ['hsl(215 100% 53.9% / 65.1%)', 'hsl(214.4 85.9% 86.1% / 74.9%)', 'hsl(225 31.4% 20% / 100%)'],
    frequency: 0.3,
    spotty: 0.77,
    midSize: 1.1,
    midIntensity: 0.5,
    density: 0.6,
    blending: 0.6,
    speed: 1,
    frame: 0,
  },
};

export const godRaysPresets: GodRaysPreset[] = [defaultPreset, auroraPreset, warpPreset, linearPreset, etherPreset];

export const GodRays: React.FC<GodRaysProps> = memo(function GodRaysImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  frequency = defaultPreset.params.frequency,
  spotty = defaultPreset.params.spotty,
  midIntensity = defaultPreset.params.midIntensity,
  midSize = defaultPreset.params.midSize,
  density = defaultPreset.params.density,
  blending = defaultPreset.params.blending,

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
}: GodRaysProps) {
  // const noiseTexture = typeof window !== 'undefined' && {u_noiseTexture: getShaderNoiseTexture()};

  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_frequency: frequency,
    u_spotty: spotty,
    u_midIntensity: midIntensity,
    u_midSize: midSize,
    u_density: density,
    u_blending: blending,
    // ...noiseTexture,

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
  } satisfies GodRaysUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={godRaysFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
