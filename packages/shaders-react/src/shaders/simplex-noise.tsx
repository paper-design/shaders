import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
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

export const defaultPreset: SimplexNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colors: ['#40a0bf', '#bf4040', '#ffcc00'],
    stepsPerColor: 3,
    softness: 0,
  },
};

export const simplexNoisePresets: SimplexNoisePreset[] = [defaultPreset];

// Helper function to ensure colors are in the correct format
const normalizeColors = (colors: (string | { value: string })[]): string[] => {
  return colors.map((color) => {
    if (typeof color === 'string') {
      return color;
    }
    if (typeof color === 'object' && color !== null && 'value' in color) {
      return String(color.value);
    }
    return String(color);
  });
};

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
  // Normalize colors to ensure they're strings
  const normalizedColors = normalizeColors(colors);

  const uniforms = {
    // Own uniforms
    u_colors: normalizedColors.map(getShaderColorFromString),
    u_colorsCount: normalizedColors.length,
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
