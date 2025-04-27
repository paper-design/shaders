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
    colorBack: 'hsla(0, 0%, 95%, 1)',
    brightness: 1.3,
  },
};

export const waterDropsPresets: WaterDropsPreset[] = [defaultPreset] as const;

export const WaterDrops: React.FC<WaterDropsProps> = memo(function WaterDropsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  brightness = defaultPreset.params.brightness,

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
    u_brightness: brightness,
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
