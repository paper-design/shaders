import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
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

export const defaultPreset: GodRaysPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    offsetX: -0.4,
    offsetY: -0.4,
    colorBack: '#002238',
    colorBloom: '#555522',
    colors: ['#ffcd66', '#ffb899', '#a8fffb'],
    density: 0.55,
    spotty: 0.28,
    midIntensity: 1,
    midSize: 0.4,
    intensity: 0.3,
    bloom: 0,
    speed: 1,
    frame: 0,
  },
};

// export const auroraPreset: GodRaysPreset = {
//   name: 'Aurora',
//   params: {
//     ...defaultObjectSizing,
//     offsetY: 1,
//     colorBack: '#404040',
//     colorBloom: '#ff8888',
//     colors: ['#666eff', '#66ff99', '#66d9ff'],
//     density: 0.5,
//     spotty: 0.9,
//     midIntensity: 0.8,
//     midSize: 0.2,
//     intensity: 0.5,
//     bloom: 1,
//     speed: 0.5,
//     frame: 0,
//   },
// };

export const warpPreset: GodRaysPreset = {
  name: 'Warp',
  params: {
    ...defaultObjectSizing,
    colorBack: '#000000',
    colorBloom: '#222288',
    colors: ['#ff00c4', '#ff8c00', '#ffffff'],
    density: 0.45,
    spotty: 0.15,
    midIntensity: 0.4,
    midSize: 0.33,
    intensity: 0.79,
    bloom: 0.4,
    speed: 2,
    frame: 0,
  },
};

export const linearPreset: GodRaysPreset = {
  name: 'Linear',
  params: {
    ...defaultObjectSizing,
    offsetX: 0.2,
    offsetY: -0.8,
    colorBack: '#000000',
    colorBloom: '#eeeeee',
    colors: ['#ffffff1f', '#ffffff3d', '#ffffff29'],
    density: 0.41,
    spotty: 0.25,
    midSize: 0.1,
    midIntensity: 0.75,
    intensity: 0.79,
    bloom: 1,
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
    colorBloom: '#ffffff',
    colors: ['#148effa6', '#c4dffebe', '#232a47'],
    density: 0.03,
    spotty: 0.77,
    midSize: 0.1,
    midIntensity: 0.6,
    intensity: 0.6,
    bloom: 0.6,
    speed: 1,
    frame: 0,
  },
};

export const godRaysPresets: GodRaysPreset[] = [defaultPreset, warpPreset, linearPreset, etherPreset];

export const GodRays: React.FC<GodRaysProps> = memo(function GodRaysImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBloom = defaultPreset.params.colorBloom,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  density = defaultPreset.params.density,
  spotty = defaultPreset.params.spotty,
  midIntensity = defaultPreset.params.midIntensity,
  midSize = defaultPreset.params.midSize,
  intensity = defaultPreset.params.intensity,
  bloom = defaultPreset.params.bloom,

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
    u_colorBloom: getShaderColorFromString(colorBloom),
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_density: density,
    u_spotty: spotty,
    u_midIntensity: midIntensity,
    u_midSize: midSize,
    u_intensity: intensity,
    u_bloom: bloom,

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
