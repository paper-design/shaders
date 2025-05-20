import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
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
    colorTest: 'hsla(0, 100%, 100%, 1)',
    colorFront: 'hsla(261, 100%, 82%, 1)',
    colorBack: 'hsla(0, 0%, 0%, 1)',
    brightness: 1.3,
    depth: 0.5,
  },
};

export const neuroNoisePresets: NeuroNoisePreset[] = [defaultPreset] as const;

export const NeuroNoise: React.FC<NeuroNoiseProps> = memo(function NeuroNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorTest = defaultPreset.params.colorTest,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
  brightness = defaultPreset.params.brightness,
  depth = defaultPreset.params.depth,

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
    u_colorTest: getShaderColorFromString(colorTest),
    u_colorFront: getShaderColorFromString(colorFront),
    u_colorBack: getShaderColorFromString(colorBack),
    u_brightness: brightness,
    u_depth: depth,

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
