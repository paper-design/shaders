import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import {
  defaultObjectSizing,
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
    scale: 1,
    colorBack: 'hsla(215, 100%, 11%, 1)',
    color1: 'hsla(45, 100%, 70%, 1)',
    color2: 'hsla(10, 100%, 80%, 1)',
    color3: 'hsla(178, 100%, 83%, 1)',
    offsetX: -0.6,
    offsetY: -0.6,
    frequency: 6,
    spotty: 0.28,
    midIntensity: 0.97,
    midSize: 2,
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
    scale: 1,
    colorBack: 'hsla(0, 0%, 25%, 1)',
    color1: 'hsla(239, 100%, 70%, 1)',
    color2: 'hsla(150, 100%, 70%, 1)',
    color3: 'hsla(200, 100%, 70%, 1)',
    offsetX: 0,
    offsetY: 1,
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
    scale: 1,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    color1: 'hsla(317, 100%, 50%, 1)',
    color2: 'hsla(25, 100%, 50%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    offsetX: 0,
    offsetY: 0,
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
    scale: 1,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    color1: 'hsl(0 0% 100% / 12%)',
    color2: 'hsl(0 0% 100% / 24%)',
    color3: 'hsl(0 0% 100% / 16%)',
    offsetX: 0.2,
    offsetY: -0.7,
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
    scale: 1,
    colorBack: 'hsl(226.7 50% 7.1% / 100%)',
    color1: 'hsl(215 100% 53.9% / 65.1%)',
    color2: 'hsl(214.4 85.9% 86.1% / 74.9%)',
    color3: 'hsl(225 31.4% 20% / 100%)',
    offsetX: -0.6,
    offsetY: 0,
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
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  color3 = defaultPreset.params.color3,
  frequency = defaultPreset.params.frequency,
  spotty = defaultPreset.params.spotty,
  midIntensity = defaultPreset.params.midIntensity,
  midSize = defaultPreset.params.midSize,
  density = defaultPreset.params.density,
  blending = defaultPreset.params.blending,

  // Sizing props
  fit = defaultPreset.params.fit,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  scale = defaultPreset.params.scale,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  ...props
}) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_color3: getShaderColorFromString(color3),
    u_frequency: frequency,
    u_spotty: spotty,
    u_midIntensity: midIntensity,
    u_midSize: midSize,
    u_density: density,
    u_blending: blending,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_scale: scale,
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
});
