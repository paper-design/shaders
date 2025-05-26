import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
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

export const defaultPreset: MetaballsPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 1,
    frame: 0,
    colorBack: '#ffffff',
    colors: ['#b399ff', '#99ffc4', '#ffe699', '#e099ff'],
    count: 7,
    size: 1,
  },
};

export const metaballsPresets: MetaballsPreset[] = [defaultPreset];

export const Metaballs: React.FC<MetaballsProps> = memo(function MetaballsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colors = defaultPreset.params.colors,
  size = defaultPreset.params.size,
  count = defaultPreset.params.count,

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
    u_colorBack: getShaderColorFromString(colorBack),
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_size: size,
    u_count: count,

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
