import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  flutedGlassFragmentShader,
  ShaderFitOptions,
  type FlutedGlassUniforms,
  type FlutedGlassParams,
  type ShaderPreset,
  defaultObjectSizing,
  GlassDistortionTypes,
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
    grid: 25,
    gridRotation: 0,
    distortionType: 'shrink',
    distortion: 1,
    xShift: 0,
    frost: 0.3,
    blur: 7,
    gridLines: 0.15,
    gridLinesBrightness: 0,
    extraLeft: 0,
    extraLeftDirection: 0,
    extraRight: 0.5,
    extraRightDirection: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
  },
};

export const flutedGlassPresets: FlutedGlassPreset[] = [defaultPreset];

export const FlutedGlass: React.FC<FlutedGlassProps> = memo(function FlutedGlassImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = defaultPreset.params.image,
  grid = defaultPreset.params.grid,
  gridRotation = defaultPreset.params.gridRotation,
  extraLeft = defaultPreset.params.extraLeft,
  extraRight = defaultPreset.params.extraRight,
  extraRightDirection = defaultPreset.params.extraRightDirection,
  extraLeftDirection = defaultPreset.params.extraLeftDirection,
  distortion = defaultPreset.params.distortion,
  frost = defaultPreset.params.frost,
  distortionType = defaultPreset.params.distortionType,
  xShift = defaultPreset.params.xShift,
  blur = defaultPreset.params.blur,
  marginLeft = defaultPreset.params.marginLeft,
  marginRight = defaultPreset.params.marginRight,
  marginTop = defaultPreset.params.marginTop,
  marginBottom = defaultPreset.params.marginBottom,
  gridLines = defaultPreset.params.gridLines,
  gridLinesBrightness = defaultPreset.params.gridLinesBrightness,

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
    u_grid: grid,
    u_gridRotation: gridRotation,
    u_distortion: distortion,
    u_extraLeft: extraLeft,
    u_extraRight: extraRight,
    u_extraRightDirection: extraRightDirection,
    u_extraLeftDirection: extraLeftDirection,
    u_frost: frost,
    u_xShift: xShift,
    u_blur: blur,
    u_gridLines: gridLines,
    u_gridLinesBrightness: gridLinesBrightness,
    u_distortionType: GlassDistortionTypes[distortionType],
    u_marginLeft: marginLeft,
    u_marginRight: marginRight,
    u_marginTop: marginTop,
    u_marginBottom: marginBottom,

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
