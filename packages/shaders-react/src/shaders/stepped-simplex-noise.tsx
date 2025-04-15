import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  getShaderColorFromString,
  steppedSimplexNoiseFragmentShader,
  ShaderFitOptions,
  type SteppedSimplexNoiseUniforms,
  type SteppedSimplexNoiseParams,
  type ShaderPreset,
  defaultPatternSizing,
} from '@paper-design/shaders';

export interface SteppedSimplexNoiseProps extends ShaderComponentProps, SteppedSimplexNoiseParams {}

type SteppedSimplexNoisePreset = ShaderPreset<SteppedSimplexNoiseParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: SteppedSimplexNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 0.15,
    frame: 0,
    colors: ['hsla(259, 100%, 50%, 1)', 'hsla(150, 100%, 50%, 1)', 'hsla(48, 100%, 50%, 1)', 'hsla(295, 100%, 50%, 1)'],
    extraSteps: 0,
  },
};

export const steppedSimplexNoisePresets: SteppedSimplexNoisePreset[] = [defaultPreset];

export const SteppedSimplexNoise: React.FC<SteppedSimplexNoiseProps> = memo(function SteppedSimplexNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  extraSteps = defaultPreset.params.extraSteps,

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
}: SteppedSimplexNoiseProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_extraSteps: extraSteps,

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
  } satisfies SteppedSimplexNoiseUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={steppedSimplexNoiseFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
