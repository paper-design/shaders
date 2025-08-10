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
    fit: 'contain',
    speed: 1,
    frame: 0,
    colorBack: '#1b5765',
    highlightColor: '#8fffff',
    image: '/images/059.jpg',
    highlights: 0.12,
    layering: 0.5,
    edges: 0.8,
    waves: 0.2,
    caustic: 0.1,
    effectScale: 1,
  },
};

export const abstractPreset: WaterPreset = {
  name: 'Abstract',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 1.2,
    speed: 1,
    frame: 0,
    colorBack: '#ff6166',
    highlightColor: '#19ff66',
    image: '/images/059.jpg',
    highlights: 1,
    layering: 1,
    edges: 0,
    waves: 0.5,
    caustic: 1,
    effectScale: 5,
  },
};

export const streamingPreset: WaterPreset = {
  name: 'Streaming',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    scale: 0.7,
    speed: 1.6,
    frame: 0,
    colorBack: '#ffffff',
    highlightColor: '#ffffff',
    image: '/images/059.jpg',
    highlights: 0,
    layering: 0,
    edges: 0,
    waves: 0.5,
    caustic: 0,
    effectScale: 5,
  },
};

export const slowMoPreset: WaterPreset = {
  name: 'Slow Mo',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    scale: 1,
    speed: 0.1,
    frame: 0,
    colorBack: '#ffffff',
    highlightColor: '#ffffff',
    image: '/images/059.jpg',
    highlights: 0.4,
    layering: 0,
    edges: 0,
    waves: 0,
    caustic: 0.2,
    effectScale: 2,
  },
};


export const waterPresets: WaterPreset[] = [defaultPreset, slowMoPreset, abstractPreset, streamingPreset];

export const Water: React.FC<WaterProps> = memo(function WaterImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  highlightColor = defaultPreset.params.highlightColor,
  image = defaultPreset.params.image,
  highlights = defaultPreset.params.highlights,
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
    u_highlightColor: getShaderColorFromString(highlightColor),
    u_highlights: highlights,
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
