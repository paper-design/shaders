import { swirlPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = swirlPresets[0].params;

export const swirlDef: ShaderDef = {
  name: 'Swirl',
  description: 'Animated bands of color twisting and bending, producing spirals, arcs, and flowing circular patterns.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 colors used for the stripes',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'bandCount',
      type: 'number',
      min: 0,
      max: 15,
      step: 1,
      defaultValue: defaultParams.bandCount,
      description: 'Number of color bands (0 for concentric ripples)',
    },
    {
      name: 'twist',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.twist,
      description: 'Vortex power (0 = straight sectoral shapes)',
    },
    {
      name: 'center',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.center,
      description: 'How far from the center the swirl colors begin to appear',
    },
    {
      name: 'proportion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.proportion,
      description: 'Blend point between colors (0.5 = equal distribution)',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description: 'Color transition sharpness (0 = hard edge, 1 = smooth gradient)',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description: 'Strength of noise distortion (no effect with noiseFrequency = 0)',
    },
    {
      name: 'noiseFrequency',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noiseFrequency,
      description: 'Noise frequency (no effect with noise = 0)',
    },
    ...animatedCommonParams,
  ],
};
