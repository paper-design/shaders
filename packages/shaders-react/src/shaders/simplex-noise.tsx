import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  getShaderColorFromString,
  simplexNoiseFragmentShader,
  ShaderFitOptions,
  type SimplexNoiseUniforms,
  type SimplexNoiseParams,
  type ShaderPreset,
  defaultPatternSizing,
} from '@paper-design/shaders';

export interface SimplexNoiseProps extends ShaderComponentProps, SimplexNoiseParams {}

type SimplexNoisePreset = ShaderPreset<SimplexNoiseParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: SimplexNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colors: ['hsla(259, 100%, 50%, 1)', 'hsla(150, 100%, 50%, 1)', 'hsla(48, 100%, 50%, 1)', 'hsla(295, 100%, 50%, 1)'],
    stepsPerColor: 1,
    softness: 0,
  },
};

export const simplexNoisePresets: SimplexNoisePreset[] = [defaultPreset];

export const SimplexNoise: React.FC<SimplexNoiseProps> = memo(function SimplexNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  stepsPerColor = defaultPreset.params.stepsPerColor,
  softness = defaultPreset.params.softness,

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
}: SimplexNoiseProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_stepsPerColor: stepsPerColor,
    u_softness: softness,

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
  } satisfies SimplexNoiseUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={simplexNoiseFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
