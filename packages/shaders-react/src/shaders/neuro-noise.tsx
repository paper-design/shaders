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
    colorMid: '#bf9eff',
    colorBack: '#000000',
    brightness: 0.3,
    contrast: 0.6,
  },
};

export const neuroNoisePresets: NeuroNoisePreset[] = [defaultPreset] as const;

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
