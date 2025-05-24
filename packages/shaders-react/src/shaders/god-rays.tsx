import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
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
    offsetX: -0.4,
    offsetY: -0.4,
    colorBack: '#002238',
    colors: ['#ffcd66', '#ffb899', '#a8fffb'],
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
    colorBack: '#404040',
    colors: ['#666eff', '#66ff99', '#66d9ff'],
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
    colorBack: '#000000',
    colors: ['#ff00c4', '#ff8c00', '#ffffff'],
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
    colorBack: '#000000',
    colors: ['#ffffff1f', '#ffffff3d', '#ffffff29'],
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
    colorBack: '#090f1d',
    colors: ['#148effa6', '#c4dffebe', '#232a47'],
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
