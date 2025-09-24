import { simplexNoisePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = simplexNoisePresets[0].params;

export const simplexNoiseDef: ShaderDef = {
  name: 'Simplex Noise',
  description: 'A multi-color gradient mapped into smooth, animated curves, delivering a sleek, futuristic visual.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 base colors',
    },
    {
      name: 'stepsPerColor',
      type: 'number',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: defaultParams.stepsPerColor,
      description:
        'Number of extra colors between base colors (1 = N color palette, 2 = 2×N color palette, 3 = 3×N color palette, etc)',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description: 'Color transition sharpness (0 = hard edge, 1 = smooth gradient)',
    },
    ...animatedCommonParams,
  ],
};
