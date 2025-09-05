import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  neuroNoiseFragmentShader,
  ShaderFitOptions,
  type NeuroNoiseParams,
  type NeuroNoiseUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface NeuroNoiseProps extends ShaderComponentProps, NeuroNoiseParams {}

type NeuroNoisePreset = ShaderPreset<NeuroNoiseParams>;

export const defaultPreset: NeuroNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorFront: '#ffffff',
    colorMid: '#47a6ff',
    colorBack: '#000000',
    brightness: 0.05,
    contrast: 0.3,
  },
};

export const sensationPreset: NeuroNoisePreset = {
  name: 'Sensation',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorFront: '#00c8ff',
    colorMid: '#fbff00',
    colorBack: '#8b42ff',
    brightness: 0.19,
    contrast: 0.12,
    scale: 3,
  },
};

export const bloodstreamPreset: NeuroNoisePreset = {
  name: 'Bloodstream',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorFront: '#ff0000',
    colorMid: '#ff0000',
    colorBack: '#ffffff',
    brightness: 0.24,
    contrast: 0.17,
    scale: 0.7,
  },
};

export const ghostPreset: NeuroNoisePreset = {
  name: 'Ghost',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorFront: '#ffffff',
    colorMid: '#000000',
    colorBack: '#ffffff',
    brightness: 0.0,
    contrast: 1.0,
    scale: 0.55,
  },
};

export const neuroNoisePresets: NeuroNoisePreset[] = [
  defaultPreset,
  sensationPreset,
  bloodstreamPreset,
  ghostPreset,
] as const;

export const NeuroNoise: React.FC<NeuroNoiseProps> = memo(function NeuroNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorMid = defaultPreset.params.colorMid,
  colorBack = defaultPreset.params.colorBack,
  brightness = defaultPreset.params.brightness,
  contrast = defaultPreset.params.contrast,

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
}: NeuroNoiseProps) {
  const uniforms = {
    // Own uniforms
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorMid: getShaderColorFromString(colorMid),
    u_colorBack: getShaderColorFromString(colorBack),
    u_brightness: brightness,
    u_contrast: contrast,

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
  } satisfies NeuroNoiseUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={neuroNoiseFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
