import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  waterFragmentShader,
  getShaderColorFromString,
  ShaderFitOptions,
  type WaterUniforms,
  type WaterParams,
  type ShaderPreset,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface WaterProps extends ShaderComponentProps, WaterParams {}

type WaterPreset = ShaderPreset<WaterParams>;

export const defaultPreset: WaterPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 0.9,
    speed: 1,
    frame: 0,
    colorBack: '#0db5a7',
    image: '/images/087.png',
    highlights: 0.2,
    temperature: 0.5,
    layering: 0.5,
    edges: 0.15,
    waves: 0.15,
    caustic: 0.2,
    effectScale: 11,
  },
};

export const tilePreset: WaterPreset = {
  name: 'Tiles',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 1.02,
    speed: 1,
    frame: 0,
    colorBack: '#ffffff',
    image: '/images/069.jpg',
    highlights: 0.2,
    temperature: 0.5,
    layering: 1,
    edges: 0,
    waves: 0,
    caustic: 0.1,
    effectScale: 20,
  },
};

export const causticPreset: WaterPreset = {
  name: 'Caustic',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    scale: 0.75,
    speed: 1,
    frame: 0,
    colorBack: '#ffffff',
    image: '/images/031.jpg',
    highlights: 0.2,
    temperature: 0.5,
    layering: 1,
    edges: 0.25,
    waves: 0,
    caustic: 0.1,
    effectScale: 20,
  },
};

export const distortionPreset: WaterPreset = {
  name: 'Distortion',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 1.25,
    speed: 1,
    frame: 0,
    colorBack: '#ffffff',
    image: '/images/066.jpg',
    highlights: 0,
    temperature: 0,
    layering: 0.35,
    edges: 0,
    waves: 0.4,
    caustic: 0.11,
    effectScale: 19,
  },
};

export const waterPresets: WaterPreset[] = [defaultPreset, causticPreset, tilePreset, distortionPreset];

export const Water: React.FC<WaterProps> = memo(function WaterImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  image = defaultPreset.params.image,
  highlights = defaultPreset.params.highlights,
  temperature = defaultPreset.params.temperature,
  layering = defaultPreset.params.layering,
  waves = defaultPreset.params.waves,
  edges = defaultPreset.params.edges,
  caustic = defaultPreset.params.caustic,
  effectScale = defaultPreset.params.effectScale,

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
}: WaterProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_colorBack: getShaderColorFromString(colorBack),
    u_highlights: highlights,
    u_temperature: temperature,
    u_layering: layering,
    u_waves: waves,
    u_edges: edges,
    u_caustic: caustic,
    u_effectScale: effectScale,

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
  } satisfies WaterUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={waterFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
