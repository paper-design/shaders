import {
  defaultPatternSizing,
  getShaderColorFromString,
  ShaderFitOptions,
  type ShaderPreset,
  type TartanParams,
  type TartanUniforms,
  tartanFragmentShader,
} from '@paper-design/shaders';
import { memo } from 'react';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
import { type ShaderComponentProps, ShaderMount } from '../shader-mount.js';

export interface TartanProps extends ShaderComponentProps, TartanParams {}

type TartanPreset = ShaderPreset<TartanParams>;

export const defaultPreset: TartanPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    stripeCount: 6,
    stripeColors: ['#19600b', '#aa0909', '#19600b', '#083a0f', '#c3a855', '#083a0f'],
    stripeWidths: [15, 2, 20, 15, 1, 15],
    weaveSize: 3.0,
    weaveStrength: 0.25,
  },
};

export const tartanPresets: TartanPreset[] = [defaultPreset];

export const Tartan: React.FC<TartanProps> = memo(function TartanImpl({
  // Own props
  stripeCount = defaultPreset.params.stripeCount,
  stripeColors = defaultPreset.params.stripeColors,
  stripeWidths = defaultPreset.params.stripeWidths,
  weaveSize = defaultPreset.params.weaveSize,
  weaveStrength = defaultPreset.params.weaveStrength,

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
    u_stripeCount: stripeCount,
    u_stripeColors: stripeColors.map(getShaderColorFromString),
    u_stripeWidths: stripeWidths,
    u_weaveSize: weaveSize,
    u_weaveStrength: weaveStrength,

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
