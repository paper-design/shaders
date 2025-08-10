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
    // fit: 'cover',
    scale: 0.8,
    speed: 1,
    frame: 0,
    colorBack: '#b08b78',
    highlightColor: '#fff9d1',
    image: '/images/0024.jpg',
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
    scale: 6,
    speed: 1,
    frame: 0,
    colorBack: '#ffff00',
    highlightColor: '#9500ff',
    image: '/images/0024.jpg',
    highlights: 0.3,
    layering: 1,
    edges: 0,
    waves: 0.5,
    caustic: 1,
    effectScale: 6,
  },
};

export const streamingPreset: WaterPreset = {
  name: 'Streaming',
  params: {
    ...defaultObjectSizing,
    fit: 'contain',
    scale: 0.4,
    speed: 2,
    frame: 0,
    colorBack: '#ffffff00',
    highlightColor: '#ffffff',
    image: '/images/0024.jpg',
    highlights: 0,
    layering: 0,
    edges: 0,
    waves: 0.5,
    caustic: 0,
    effectScale: 3,
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
    colorBack: '#ffffff00',
    highlightColor: '#ffffff',
    image: '/images/0024.jpg',
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
