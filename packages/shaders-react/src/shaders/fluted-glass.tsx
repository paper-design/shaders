import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  flutedGlassFragmentShader,
  ShaderFitOptions,
  type FlutedGlassUniforms,
  type FlutedGlassParams,
  type ShaderPreset,
  defaultObjectSizing,
  GlassDistortionShapes,
  GlassGridShapes,
} from '@paper-design/shaders';

export interface FlutedGlassProps extends ShaderComponentProps, FlutedGlassParams {}

type FlutedGlassPreset = ShaderPreset<FlutedGlassParams>;

export const defaultPreset: FlutedGlassPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 0,
    frame: 0,
    image: '/images/070.jpg',
    fit: 'cover',
    grid: 40,
    gridRotation: 0,
    distortionShape: 'type #1',
    gridShape: 'lines',
    distortion: 0.4,
    shift: 0,
    frost: 0,
    blur: 3,
    gridLines: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
  },
};

export const wavesPreset: FlutedGlassPreset = {
  name: 'Waves',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    image: '/images/070.jpg',
    grid: 39,
    gridRotation: 90,
    distortionShape: 'type #3',
    gridShape: 'wave',
    distortion: 0.3,
    shift: 0,
    frost: 0,
    blur: 0,
    gridLines: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
  },
};

export const irregularPreset: FlutedGlassPreset = {
  name: 'Irregular lines',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    image: '/images/070.jpg',
    grid: 100,
    gridRotation: 0,
    distortionShape: 'type #5',
    gridShape: 'linesIrregular',
    distortion: 1,
    shift: -0.4,
    frost: 0,
    blur: 3,
    gridLines: 0.5,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
  },
};

export const foldsPreset: FlutedGlassPreset = {
  name: 'Folds',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    image: '/images/070.jpg',
    grid: 135,
    gridRotation: 0,
    distortionShape: 'type #4',
    gridShape: 'lines',
    distortion: 0.25,
    shift: 0,
    frost: 0,
    blur: 0,
    gridLines: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
  },
};

export const flutedGlassPresets: FlutedGlassPreset[] = [defaultPreset, irregularPreset, wavesPreset, foldsPreset];

export const FlutedGlass: React.FC<FlutedGlassProps> = memo(function FlutedGlassImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = defaultPreset.params.image,
  grid = defaultPreset.params.grid,
  gridRotation = defaultPreset.params.gridRotation,
  distortion = defaultPreset.params.distortion,
  frost = defaultPreset.params.frost,
  distortionShape = defaultPreset.params.distortionShape,
  gridShape = defaultPreset.params.gridShape,
  shift = defaultPreset.params.shift,
  blur = defaultPreset.params.blur,
  marginLeft = defaultPreset.params.marginLeft,
  marginRight = defaultPreset.params.marginRight,
  marginTop = defaultPreset.params.marginTop,
  marginBottom = defaultPreset.params.marginBottom,
  gridLines = defaultPreset.params.gridLines,

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
}: FlutedGlassProps) {
  const uniforms = {
    // Own uniforms
    u_image: image,
    u_grid: grid,
    u_gridRotation: gridRotation,
    u_distortion: distortion,
    u_frost: frost,
    u_shift: shift,
    u_blur: blur,
    u_gridLines: gridLines,
    u_distortionShape: GlassDistortionShapes[distortionShape],
    u_gridShape: GlassGridShapes[gridShape],
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
