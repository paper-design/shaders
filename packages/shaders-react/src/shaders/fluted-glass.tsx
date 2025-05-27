import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  flutedGlassFragmentShader,
  ShaderFitOptions,
  type FlutedGlassUniforms,
  type FlutedGlassParams,
  type ShaderPreset,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface FlutedGlassProps extends ShaderComponentProps, FlutedGlassParams {}

type FlutedGlassPreset = ShaderPreset<FlutedGlassParams>;

export const defaultPreset: FlutedGlassPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    worldWidth: 0,
    worldHeight: 0,
    speed: 0,
    frame: 0,
    image: null,
  },
};

export const flutedGlassPresets: FlutedGlassPreset[] = [defaultPreset];

export const FlutedGlass: React.FC<FlutedGlassProps> = memo(function FlutedGlassImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = defaultPreset.params.image,

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
}) {
  const uniforms = {
    // Own uniforms
    u_image: image,

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
  } satisfies FlutedGlassUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={flutedGlassFragmentShader}
      uniforms={uniforms}
    />
  );
});
