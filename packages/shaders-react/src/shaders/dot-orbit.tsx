import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  getShaderColorFromString,
  dotOrbitFragmentShader,
  ShaderFitOptions,
  type DotOrbitParams,
  type DotOrbitUniforms,
  type ShaderPreset,
  defaultPatternSizing,
} from '@paper-design/shaders';

export interface DotOrbitProps extends ShaderComponentProps, DotOrbitParams {}

type DotOrbitPreset = ShaderPreset<DotOrbitParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: DotOrbitPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 2,
    frame: 0,
    colors: ['hsla(200, 100%, 20%, 1)', 'hsla(290, 100%, 70%, 1)'],
    dotSize: 1,
    dotSizeRange: 0,
    spreading: 1,
    stepsPerColor: 1,
  },
};

export const dotOrbitPresets: DotOrbitPreset[] = [defaultPreset];

export const DotOrbit: React.FC<DotOrbitProps> = memo(function DotOrbitImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  dotSize = defaultPreset.params.dotSize,
  dotSizeRange = defaultPreset.params.dotSizeRange,
  spreading = defaultPreset.params.spreading,
  stepsPerColor = defaultPreset.params.stepsPerColor,

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
}: DotOrbitProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_dotSize: dotSize,
    u_dotSizeRange: dotSizeRange,
    u_spreading: spreading,
    u_stepsPerColor: stepsPerColor,

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
  } satisfies DotOrbitUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={dotOrbitFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
