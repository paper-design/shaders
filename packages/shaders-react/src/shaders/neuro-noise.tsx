import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  neuroNoiseFragmentShader,
  ShaderFitOptions,
  neuroNoiseDef,
  type NeuroNoiseParams,
  type NeuroNoiseUniforms,
  type ShaderPreset,
  commonParams,
} from '@paper-design/shaders';

export interface NeuroNoiseProps extends ShaderComponentProps, NeuroNoiseParams {}

type NeuroNoisePreset = ShaderPreset<NeuroNoiseParams>;

export const defaultPreset: NeuroNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: commonParams.speed!.defaultValue as number,
    frame: commonParams.frame!.defaultValue as number,
    colorFront: neuroNoiseDef.params.find((p) => p.name === 'colorFront')?.defaultValue as string,
    colorMid: '#47a6ff', // Can differ from the def default value
    colorBack: neuroNoiseDef.params.find((p) => p.name === 'colorBack')?.defaultValue as string,
    brightness: neuroNoiseDef.params.find((p) => p.name === 'brightness')?.defaultValue as number,
    contrast: neuroNoiseDef.params.find((p) => p.name === 'contrast')?.defaultValue as number,
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
  speed = commonParams.speed!.defaultValue as number,
  frame = commonParams.frame!.defaultValue as number,
  colorFront = neuroNoiseDef.params.find((p) => p.name === 'colorFront')?.defaultValue as string,
  colorMid = neuroNoiseDef.params.find((p) => p.name === 'colorMid')?.defaultValue as string,
  colorBack = neuroNoiseDef.params.find((p) => p.name === 'colorBack')?.defaultValue as string,
  brightness = neuroNoiseDef.params.find((p) => p.name === 'brightness')?.defaultValue as number,
  contrast = neuroNoiseDef.params.find((p) => p.name === 'contrast')?.defaultValue as number,

  // Sizing props
  fit = defaultPatternSizing.fit,
  scale = defaultPatternSizing.scale,
  rotation = defaultPatternSizing.rotation,
  originX = defaultPatternSizing.originX,
  originY = defaultPatternSizing.originY,
  offsetX = defaultPatternSizing.offsetX,
  offsetY = defaultPatternSizing.offsetY,
  worldWidth = defaultPatternSizing.worldWidth,
  worldHeight = defaultPatternSizing.worldHeight,
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
