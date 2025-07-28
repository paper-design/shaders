import { memo } from 'react';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  ShaderFitOptions,
  type ShaderPreset,
  tartanFragmentShader,
  type TartanParams,
  type TartanUniforms,
} from '@paper-design/shaders';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import { type ShaderComponentProps, ShaderMount } from '../shader-mount.js';

export interface TartanProps extends ShaderComponentProps, TartanParams {}

type TartanPreset = ShaderPreset<TartanParams>;

export const defaultPreset: TartanPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    stripeColors: ['#19600b', '#aa0909', '#19600b', '#041a07', '#c3a855', '#041a07'],
    stripeWidths: [30, 4, 40, 30, 1, 30],
  },
};

export const tartanPresets: TartanPreset[] = [defaultPreset];

export const Tartan: React.FC<TartanProps> = memo(function TartanImpl({
  // Own props
  stripeColors = defaultPreset.params.stripeColors,
  stripeWidths = defaultPreset.params.stripeWidths,

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
}: TartanProps) {
  const uniforms = {
    // Own uniforms
    u_stripeColors: stripeColors.map(getShaderColorFromString),
    u_stripeWidths: stripeWidths,
    u_stripeCount: stripeColors.length,

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
  } satisfies TartanUniforms;

  return <ShaderMount {...props} fragmentShader={tartanFragmentShader} uniforms={uniforms} />;
}, colorPropsAreEqual);
