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
  getShaderColorFromString,
} from '@paper-design/shaders';

export interface FlutedGlassProps extends ShaderComponentProps, FlutedGlassParams {
  /** @deprecated use `size` instead */
  count?: number;
}

type FlutedGlassPreset = ImageShaderPreset<FlutedGlassParams>;

export const defaultPreset: FlutedGlassPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    fit: 'cover',
    scale: 1,
    speed: 0,
    frame: 0,
    colorBack: '#ffffff',
    colorTint: '#000000',
    tint: 0.5,
    size: 0.45,
    angle: 0,
    distortionShape: 'prism',
    strokes: 0,
    shape: 'lines',
    distortion: 0.5,
    shift: 0,
    blur: 0,
    edges: 0,
    margin: 0,
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
    scale: 1.2,
    speed: 0,
    frame: 0,
    colorBack: '#909090',
    colorTint: '#000000',
    tint: 0,
    size: 0.7,
    angle: 0,
    distortionShape: 'contour',
    strokes: 0,
    shape: 'wave',
    distortion: 0.4,
    shift: 0,
    blur: 0,
    edges: 0,
    margin: 0,
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
    colorBack: '#909090',
    colorTint: '#000000',
    tint: 0,
    size: 0.7,
    angle: 30,
    distortionShape: 'flat',
    strokes: 0,
    shape: 'linesIrregular',
    distortion: 1,
    shift: 0,
    blur: 25,
    edges: 1,
    margin: 0,
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
    colorBack: '#909090',
    colorTint: '#000000',
    tint: 0.1,
    size: 0.25,
    angle: 0,
    distortionShape: 'cascade',
    strokes: 0,
    shape: 'lines',
    distortion: 0.75,
    shift: 0,
    blur: 0,
    edges: 0,
    margin: 0.2,
    marginLeft: 0.2,
    marginRight: 0.2,
    marginTop: 0.2,
    marginBottom: 0.2,
  },
};

export const flutedGlassPresets: FlutedGlassPreset[] = [defaultPreset, irregularPreset, wavesPreset, foldsPreset];

export const FlutedGlass: React.FC<FlutedGlassProps> = memo(function FlutedGlassImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorTint = defaultPreset.params.colorTint,
  image = '',
  tint = defaultPreset.params.tint,
  angle = defaultPreset.params.angle,
  distortion = defaultPreset.params.distortion,
  distortionShape = defaultPreset.params.distortionShape,
  strokes = defaultPreset.params.strokes,
  shape = defaultPreset.params.shape,
  shift = defaultPreset.params.shift,
  blur = defaultPreset.params.blur,
  margin,
  marginLeft = margin ?? defaultPreset.params.marginLeft,
  marginRight = margin ?? defaultPreset.params.marginRight,
  marginTop = margin ?? defaultPreset.params.marginTop,
  marginBottom = margin ?? defaultPreset.params.marginBottom,
  edges = defaultPreset.params.edges,

  // integer `count` was deprecated in favor of the normalized `size` param
  count,
  size = count === undefined ? defaultPreset.params.size : Math.pow(1 / (count * 1.6), 1 / 6) / 0.7 - 0.5,

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
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorTint: getShaderColorFromString(colorTint),
    u_tint: tint,
    u_size: size,
    u_angle: angle,
    u_distortion: distortion,
    u_shift: shift,
    u_blur: blur,
    u_edges: edges,
    u_distortionShape: GlassDistortionShapes[distortionShape],
    u_strokes: strokes,
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
      mipmaps={['u_image']}
      uniforms={uniforms}
    />
  );
});
