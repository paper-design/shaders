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

export const defaultPreset: DotOrbitPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 2,
    frame: 0,
    colorBack: '#03001f',
    colors: ['#661400', '#ccbb00', '#cc0088'],
    size: 0.9,
    sizeRange: 0,
    spreading: 1,
    stepsPerColor: 2,
  },
};

export const dotOrbitPresets: DotOrbitPreset[] = [defaultPreset];

export const DotOrbit: React.FC<DotOrbitProps> = memo(function DotOrbitImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  size = defaultPreset.params.size,
  sizeRange = defaultPreset.params.sizeRange,
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
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_size: size,
    u_sizeRange: sizeRange,
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
