import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  metaballsFragmentShader,
  ShaderFitOptions,
  type MetaballsParams,
  type MetaballsUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface MetaballsProps extends ShaderComponentProps, MetaballsParams {}

type MetaballsPreset = ShaderPreset<MetaballsParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: MetaballsPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0.6,
    frame: 0,
    colors: ['hsla(259, 100%, 80%, 1)', 'hsla(150, 100%, 80%, 1)', 'hsla(48, 100%, 80%, 1)', 'hsla(295, 100%, 80%, 1)'],
    ballsNumber: 7,
    ballSize: 1,
  },
};

export const metaballsPresets: MetaballsPreset[] = [defaultPreset];

export const Metaballs: React.FC<MetaballsProps> = memo(function MetaballsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  ballSize = defaultPreset.params.ballSize,
  ballsNumber = defaultPreset.params.ballsNumber,

  // Sizing props
  fit = defaultPreset.params.fit,
  rotation = defaultPreset.params.rotation,
  scale = defaultPreset.params.scale,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: MetaballsProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_ballSize: ballSize,
    u_ballsNumber: ballsNumber,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_rotation: rotation,
    u_scale: scale,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies MetaballsUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={metaballsFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
