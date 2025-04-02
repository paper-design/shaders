import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
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

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: NeuroNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorFront: 'hsla(261, 100%, 82%, 1)',
    colorBack: 'hsla(0, 0%, 0%, 1)',
    brightness: 1.3,
  },
};

const marblePreset: NeuroNoisePreset = {
  name: 'Marble',
  params: {
    ...defaultPatternSizing,
    scale: 0.4,
    speed: 0,
    frame: 0,
    colorFront: 'hsla(230, 24%, 15%, 1)',
    colorBack: 'hsla(0, 0%, 97%, 1)',
    brightness: 1.1,
  },
};

export const neuroNoisePresets: NeuroNoisePreset[] = [defaultPreset, marblePreset] as const;

export const NeuroNoise: React.FC<NeuroNoiseProps> = memo(function NeuroNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  brightness = defaultPreset.params.brightness,

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
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_brightness: brightness,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_scale: scale,
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
});
