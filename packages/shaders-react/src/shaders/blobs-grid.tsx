import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  blobsGridFragmentShader,
  ShaderFitOptions,
  type BlobsGridParams,
  type BlobsGridUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface BlobsGridProps extends ShaderComponentProps, BlobsGridParams {}

type BlobsGridPreset = ShaderPreset<BlobsGridParams>;

export const defaultPreset: BlobsGridPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    scale: 0.45,
    speed: 0.5,
    frame: 0,
    colors: ['#e4ab1b', '#33b1ff', '#db579b'],
    stepsPerColor: 2,
    colorBack: '#000000',
    colorShade: '#ffffff',
    colorSpecular: '#ffffffa1',
    colorInnerShadow: '#000000',
    distortion: 8.6,
    shade: 0.0,
    specular: 0,
    specularNormal: 0,
    size: 0.49,
    innerShadow: 0,
  },
};

export const dropsPreset: BlobsGridPreset = {
  name: 'Drops',
  params: {
    ...defaultPatternSizing,
    scale: 0.5,
    speed: 2,
    frame: 0,
    colors: ['#ff00aa'],
    stepsPerColor: 3,
    colorBack: '#ffaa00',
    colorShade: '#ffffff',
    colorSpecular: '#ffffffa1',
    colorInnerShadow: '#00ffd0',
    distortion: 9.2,
    size: 0.04,
    specular: 1.0,
    specularNormal: 1.0,
    shade: 1.0,
    innerShadow: 0.06,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
  },
};

export const shadowsPreset: BlobsGridPreset = {
  name: 'Shadows',
  params: {
    ...defaultPatternSizing,
    scale: 0.5,
    speed: 2,
    frame: 0,
    colors: ['#c8e9c8', '#037c6e', '#ff9100'],
    stepsPerColor: 3,
    colorBack: '#ffffff',
    colorShade: '#ffffff',
    colorSpecular: '#ffffffa1',
    colorInnerShadow: '#000000',
    distortion: 5.6,
    shade: 1.0,
    specular: 0.0,
    specularNormal: 0.82,
    size: 0.51,
    innerShadow: 0,
  },
};

export const specularPreset: BlobsGridPreset = {
  name: 'Specular',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colors: ['#ff7b00', '#ff29f1', '#00b2ff'],
    stepsPerColor: 2,
    colorBack: '#000000',
    colorShade: '#5b2f3d',
    colorSpecular: '#ffffff80',
    colorInnerShadow: '#000000',
    distortion: 7,
    shade: 0.3,
    specular: 0.75,
    specularNormal: 0.75,
    size: 0.75,
    innerShadow: 0.27,
  },
};

export const blobsGridPresets: BlobsGridPreset[] = [defaultPreset, shadowsPreset, dropsPreset, specularPreset] as const;

export const BlobsGrid: React.FC<BlobsGridProps> = memo(function BlobsGridImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  stepsPerColor = defaultPreset.params.stepsPerColor,
  colorBack = defaultPreset.params.colorBack,
  colorShade = defaultPreset.params.colorShade,
  colorSpecular = defaultPreset.params.colorSpecular,
  colorInnerShadow = defaultPreset.params.colorInnerShadow,
  distortion = defaultPreset.params.distortion,
  shade = defaultPreset.params.shade,
  specular = defaultPreset.params.specular,
  specularNormal = defaultPreset.params.specularNormal,
  size = defaultPreset.params.size,
  innerShadow = defaultPreset.params.innerShadow,

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
}: BlobsGridProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_stepsPerColor: stepsPerColor,
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorShade: getShaderColorFromString(colorShade),
    u_colorSpecular: getShaderColorFromString(colorSpecular),
    u_colorInnerShadow: getShaderColorFromString(colorInnerShadow),
    u_distortion: distortion,
    u_shade: shade,
    u_specular: specular,
    u_specularNormal: specularNormal,
    u_size: size,
    u_innerShadow: innerShadow,

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
  } satisfies BlobsGridUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={blobsGridFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
