import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
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
    color1: 'hsla(350, 90%, 55%, 1)',
    color2: 'hsla(350, 80%, 60%, 1)',
    color3: 'hsla(20, 85%, 70%, 1)',
    ballSize: 1,
    visibilityRange: 0.4,
  },
};

export const metaballsPresets: MetaballsPreset[] = [defaultPreset];

export const Metaballs: React.FC<MetaballsProps> = memo(function MetaballsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  color3 = defaultPreset.params.color3,
  ballSize = defaultPreset.params.ballSize,
  visibilityRange = defaultPreset.params.visibilityRange,

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
}) {
  const uniforms = {
    // Own uniforms
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_color3: getShaderColorFromString(color3),
    u_ballSize: ballSize,
    u_visibilityRange: visibilityRange,

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
});
