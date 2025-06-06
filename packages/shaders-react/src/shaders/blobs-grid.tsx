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
    speed: 1,
    frame: 0,
    colors: ['#e64d1a', '#4de61a', '#1aa2e6', '#e6911a'],
    stepsPerColor: 2,
    colorBack: '#000000',
    colorShade: '#5b2f3d',
    colorSpecular: '#ffffff80',
    colorOutline: '#4c40bf80',
    distortion: 7,
    shade: 0.3,
    specular: 0.5,
    specularNormal: 0.75,
    size: 0.75,
    outline: 0.4,
  },
};

export const flatPreset: BlobsGridPreset = {
  name: 'Flat',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    speed: 0.5,
    frame: 0,
    colors: ['#e4ab1b', '#33b1ff', '#db579b', '#ffffff00'],
    stepsPerColor: 2,
    colorBack: '#ffffff',
    colorShade: '#b47489',
    colorSpecular: '#ffffff57',
    colorOutline: '#282541',
    distortion: 8.6,
    shade: 0.0,
    specular: 1,
    specularNormal: 0.12,
    size: 0.52,
    outline: 0.0,
  },
};

export const dropsPreset: BlobsGridPreset = {
  name: 'Drops',
  params: {
    ...defaultPatternSizing,
    scale: 1,
    speed: 2,
    frame: 0,
    colors: ['#e7ac18', '#6bbcff', '#9d2060', '#ff0000'],
    stepsPerColor: 2,
    colorBack: '#292929',
    colorShade: '#000000',
    colorSpecular: '#ffffff57',
    colorOutline: '#000000',
    distortion: 8,
    shade: 1.0,
    specular: 0.0,
    specularNormal: 0.82,
    size: 0.1,
    outline: 0.03,
  },
};

export const shadowsPreset: BlobsGridPreset = {
  name: 'Shadows',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    speed: 2.0,
    frame: 0,
    colors: ['#c8e9c8', '#a899e6', '#fa9edd', '#a899e6'],
    stepsPerColor: 3,
    colorBack: '#a899e6',
    colorShade: '#000000',
    colorSpecular: '#ffffff57',
    colorOutline: '#000000',
    distortion: 5.6,
    shade: 1.0,
    specular: 0.0,
    specularNormal: 0.82,
    size: 0.51,
    outline: 0.0,
  },
};

export const blobsGridPresets: BlobsGridPreset[] = [defaultPreset, flatPreset, dropsPreset, shadowsPreset] as const;

export const BlobsGrid: React.FC<BlobsGridProps> = memo(function BlobsGridImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  stepsPerColor = defaultPreset.params.stepsPerColor,
  colorBack = defaultPreset.params.colorBack,
  colorShade = defaultPreset.params.colorShade,
  colorSpecular = defaultPreset.params.colorSpecular,
  colorOutline = defaultPreset.params.colorOutline,
  distortion = defaultPreset.params.distortion,
  shade = defaultPreset.params.shade,
  specular = defaultPreset.params.specular,
  specularNormal = defaultPreset.params.specularNormal,
  size = defaultPreset.params.size,
  outline = defaultPreset.params.outline,

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
    u_colorOutline: getShaderColorFromString(colorOutline),
    u_distortion: distortion,
    u_shade: shade,
    u_specular: specular,
    u_specularNormal: specularNormal,
    u_size: size,
    u_outline: outline,

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
