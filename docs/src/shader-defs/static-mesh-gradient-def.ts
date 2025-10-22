import { staticMeshGradientPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticCommonParams } from './common-param-def';

const defaultParams = staticMeshGradientPresets[0].params;

export const staticMeshGradientDef: ShaderDef = {
  name: 'Static Mesh Gradient',
  description:
    'Multi-point mesh gradients with up to 10 color spots, enhanced by two-direction warping, adjustable blend sharpness, and grain controls. Perfect for elegant wallpapers and atmospheric backdrops.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 colors used in the gradient',
    },
    {
      name: 'positions',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: defaultParams.positions,
      description: 'Color spots placement',
    },
    {
      name: 'waveX',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.waveX,
      description: 'Strength of sine wave distortion along X axis',
    },
    {
      name: 'waveXShift',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.waveXShift,
      description: 'Phase offset applied to the X-axis wave',
    },
    {
      name: 'waveY',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.waveY,
      description: 'Strength of sine wave distortion along Y axis',
    },
    {
      name: 'waveYShift',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.waveYShift,
      description: 'Phase offset applied to the Y-axis wave',
    },
    {
      name: 'mixing',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.mixing,
      description: 'Blending behavior (sharper vs. smoother color transitions)',
    },
    {
      name: 'grainMixer',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainMixer,
      description: 'Strength of grain distortion applied to color edges',
    },
    {
      name: 'grainOverlay',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainOverlay,
      description: 'Post-processing RGB grain overlay',
    },
    ...staticCommonParams,
  ],
};
