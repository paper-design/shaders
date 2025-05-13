import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  getShaderNoiseTexture,
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
    scale: 2,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(0, 50%, 0%, 1)',
    shadeColor: 'hsla(300, 100%, 50%, 1)',
    specularColor: 'hsla(0, 0%, 100%, .25)',
    outlineColor: 'hsla(190, 50%, 0%, 1)',
    dropShapeDistortion: 7,
    texturing: 0.04,
    specular: 0,
    specularNormal: 1,
    visibility: 1,
    test1: 0.3,
    test2: 0.9,
    outline: 1,
  },
};

export const waterDropsPresets: WaterDropsPreset[] = [defaultPreset] as const;

export const WaterDrops: React.FC<WaterDropsProps> = memo(function WaterDropsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  shadeColor = defaultPreset.params.shadeColor,
  specularColor = defaultPreset.params.specularColor,
  outlineColor = defaultPreset.params.outlineColor,
  dropShapeDistortion = defaultPreset.params.dropShapeDistortion,
  texturing = defaultPreset.params.texturing,
  specular = defaultPreset.params.specular,
  specularNormal = defaultPreset.params.specularNormal,
  visibility = defaultPreset.params.visibility,
  test1 = defaultPreset.params.test1,
  test2 = defaultPreset.params.test2,
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
  const noiseTexture = typeof window !== 'undefined' && { u_noiseTexture: getShaderNoiseTexture() };
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_shadeColor: getShaderColorFromString(shadeColor),
    u_specularColor: getShaderColorFromString(specularColor),
    u_outlineColor: getShaderColorFromString(outlineColor),
    u_dropShapeDistortion: dropShapeDistortion,
    u_textureing: texturing,
    u_specular: specular,
    u_specularNormal: specularNormal,
    u_visibility: visibility,
    u_test1: test1,
    u_test2: test2,
    u_outline: outline,
    ...noiseTexture,

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
