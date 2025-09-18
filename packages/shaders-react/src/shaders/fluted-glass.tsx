import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import {
  flutedGlassFragmentShader,
  ShaderFitOptions,
  type FlutedGlassUniforms,
  type FlutedGlassParams,
  defaultObjectSizing,
  GlassDistortionShapes,
  GlassGridShapes,
  type ImageShaderPreset,
} from '@paper-design/shaders';

export interface FlutedGlassProps extends ShaderComponentProps, FlutedGlassParams {}

type FlutedGlassPreset = ImageShaderPreset<FlutedGlassParams>;

export const defaultPreset: FlutedGlassPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    speed: 0,
    frame: 0,
    count: 80,
    angle: 0,
    distortionShape: 'lens',
    shape: 'lines',
    distortion: 0.5,
    shift: 0,
    blur: 3,
    highlights: 0,
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
    count: 20,
    angle: 0,
    distortionShape: 'contour',
    shape: 'wave',
    distortion: 0.3,
    shift: 0,
    blur: 0,
    highlights: 0,
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
    scale: 4,
    speed: 0,
    frame: 0,
    count: 32,
    angle: 150,
    distortionShape: 'facete',
    shape: 'linesIrregular',
    distortion: 1,
    shift: 0,
    blur: 25,
    highlights: 1,
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
    count: 50,
    angle: 0,
    distortionShape: 'cascade',
    shape: 'lines',
    distortion: 0.75,
    shift: 0,
    blur: 0,
    highlights: 0,
    marginLeft: 0.05,
    marginRight: 0.05,
    marginTop: 0.2,
    marginBottom: 0.2,
  },
};

export const flutedGlassPresets: FlutedGlassPreset[] = [defaultPreset, irregularPreset, wavesPreset, foldsPreset];

export const FlutedGlass: React.FC<FlutedGlassProps> = memo(function FlutedGlassImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  image = 'https://shaders.paper.design/images/image-filters/0018.webp',
  count = defaultPreset.params.count,
  angle = defaultPreset.params.angle,
  distortion = defaultPreset.params.distortion,
  distortionShape = defaultPreset.params.distortionShape,
  shape = defaultPreset.params.shape,
  shift = defaultPreset.params.shift,
  blur = defaultPreset.params.blur,
  marginLeft = defaultPreset.params.marginLeft,
  marginRight = defaultPreset.params.marginRight,
  marginTop = defaultPreset.params.marginTop,
  marginBottom = defaultPreset.params.marginBottom,
  highlights = defaultPreset.params.highlights,

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
    u_count: count,
    u_angle: angle,
    u_distortion: distortion,
    u_shift: shift,
    u_blur: blur,
    u_highlights: highlights,
    u_distortionShape: GlassDistortionShapes[distortionShape],
    u_shape: GlassGridShapes[shape],
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
