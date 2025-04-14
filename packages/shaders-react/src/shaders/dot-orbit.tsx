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
    color1: 'hsla(358, 66%, 49%, 1)',
    color2: 'hsla(145, 30%, 33%, 1)',
    color3: 'hsla(39, 88%, 52%, 1)',
    color4: 'hsla(274, 30%, 35%, 1)',
    dotSize: 0.7,
    dotSizeRange: 0.4,
    spreading: 1,
  },
};

export const dotOrbitPresets: DotOrbitPreset[] = [defaultPreset];

export const DotOrbit: React.FC<DotOrbitProps> = memo(function DotOrbitImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  color3 = defaultPreset.params.color3,
  color4 = defaultPreset.params.color4,
  dotSize = defaultPreset.params.dotSize,
  dotSizeRange = defaultPreset.params.dotSizeRange,
  spreading = defaultPreset.params.spreading,

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
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_color3: getShaderColorFromString(color3),
    u_color4: getShaderColorFromString(color4),
    u_dotSize: dotSize,
    u_dotSizeRange: dotSizeRange,
    u_spreading: spreading,

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
