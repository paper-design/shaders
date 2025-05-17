import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  waterDropsFragmentShader,
  ShaderFitOptions,
  type WaterDropsParams,
  type WaterDropsUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface WaterDropsProps extends ShaderComponentProps, WaterDropsParams {}

type WaterDropsPreset = ShaderPreset<WaterDropsParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: WaterDropsPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colors: ['hsla(200, 80%, 50%, 1)', 'hsla(105, 80%, 50%, 1)', 'hsla(50, 80%, 50%, 1)', 'hsla(35, 80%, 50%, 1)'],
    stepsPerColor: 2,
    colorBack: 'hsla(0, 50%, 0%, 1)',
    shadeColor: 'hsla(340, 100%, 50%, 1)',
    specularColor: 'hsla(0, 0%, 100%, .5)',
    outlineColor: 'hsla(246, 50%, 50%, 0.5)',
    distortion: 7,
    shade: 0.3,
    specular: 0.5,
    specularNormal: 0.75,
    size: 0.75,
    outline: 0.4,
  },
};

export const flatPreset: WaterDropsPreset = {
  name: 'Flat',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    speed: 0.5,
    frame: 0,
    colors: ['hsla(43, 79%, 50%, 1)', 'hsla(203, 100%, 60%, 1)', 'hsla(329, 65%, 60%, 1)', 'hsla(0, 0%, 100%, 1)'],
    stepsPerColor: 2,
    colorBack: 'hsla(0, 0%, 100%, 1)',
    shadeColor: 'hsla(340, 30%, 58%, 1)',
    specularColor: 'hsla(0, 0%, 100%, 0.34)',
    outlineColor: 'hsla(246, 28%, 20%, 1)',
    distortion: 8.6,
    shade: 0.0,
    specular: 1,
    specularNormal: 0.12,
    size: 0.52,
    outline: 0.0,
  },
};

export const dropsPreset: WaterDropsPreset = {
  name: 'Drops',
  params: {
    ...defaultPatternSizing,
    scale: 1,
    speed: 2,
    frame: 0,
    colors: ['hsla(43, 81%, 50%, 1)', 'hsla(207, 100%, 71%, 1)', 'hsla(329, 66%, 37%, 1)', 'hsla(0, 100%, 50%, 1)'],
    stepsPerColor: 2,
    colorBack: 'hsla(0, 0%, 16%, 1)',
    shadeColor: 'hsla(0, 0%, 0%, 1)',
    specularColor: 'hsla(0, 0%, 100%, 0.34)',
    outlineColor: 'hsla(0, 0%, 0%, 1)',
    distortion: 8,
    shade: 1.0,
    specular: 0.0,
    specularNormal: 0.82,
    size: 0.1,
    outline: 0.03,
  },
};

export const shadowsPreset: WaterDropsPreset = {
  name: 'Shadows',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    speed: 2.0,
    frame: 0,
    colors: ['hsla(120, 43%, 85%, 1)', 'hsla(252, 60%, 75%, 1)', 'hsla(319, 90%, 80%, 1)', 'hsla(252, 60%, 75%, 1)'],
    stepsPerColor: 3,
    colorBack: 'hsla(252, 60%, 75%, 1)',
    shadeColor: 'hsla(0, 0%, 0%, 1)',
    specularColor: 'hsla(0, 0%, 100%, 0.34)',
    outlineColor: 'hsla(0, 0%, 0%, 1)',
    distortion: 5.6,
    shade: 1.0,
    specular: 0.0,
    specularNormal: 0.82,
    size: 0.51,
    outline: 0.0,
  },
};

export const waterDropsPresets: WaterDropsPreset[] = [defaultPreset, flatPreset, dropsPreset, shadowsPreset] as const;

export const WaterDrops: React.FC<WaterDropsProps> = memo(function WaterDropsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  stepsPerColor = defaultPreset.params.stepsPerColor,
  colorBack = defaultPreset.params.colorBack,
  shadeColor = defaultPreset.params.shadeColor,
  specularColor = defaultPreset.params.specularColor,
  outlineColor = defaultPreset.params.outlineColor,
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
}: WaterDropsProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_stepsPerColor: stepsPerColor,
    u_colorBack: getShaderColorFromString(colorBack),
    u_shadeColor: getShaderColorFromString(shadeColor),
    u_specularColor: getShaderColorFromString(specularColor),
    u_outlineColor: getShaderColorFromString(outlineColor),
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
  } satisfies WaterDropsUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={waterDropsFragmentShader} uniforms={uniforms} />
  );
}, colorPropsAreEqual);
