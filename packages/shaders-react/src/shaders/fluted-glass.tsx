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
    numSegments: 10,
    inputOutputRatio: 1,
    overlap: 0.5,
    // frost: 0.1,
    lightStrength: 0.2,
  },
};

export const flutedGlassPresets: FlutedGlassPreset[] = [defaultPreset];

export const FlutedGlass: React.FC<FlutedGlassProps> = memo(function FlutedGlassImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = defaultPreset.params.image,
  numSegments = defaultPreset.params.numSegments,
  inputOutputRatio = defaultPreset.params.inputOutputRatio,
  overlap = defaultPreset.params.overlap,
  // frost = defaultPreset.params.frost,
  lightStrength = defaultPreset.params.lightStrength,

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
    u_numSegments: numSegments,
    u_inputOutputRatio: inputOutputRatio,
    u_overlap: overlap,
    // u_frost: frost,
    u_lightStrength: lightStrength,

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
