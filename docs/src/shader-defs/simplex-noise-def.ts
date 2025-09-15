import { simplexNoisePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

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
    {
      name: 'width',
      type: 'number | string',
      defaultValue: undefined,
      description: 'CSS width style of the shader element',
    },
    {
      name: 'height',
      type: 'number | string',
      defaultValue: undefined,
      description: 'CSS height style of the shader element',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.01,
      max: 4,
      defaultValue: defaultParams.scale,
      description: 'Overall zoom level of the graphics',
    },
    {
      name: 'rotation',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.rotation,
      description: 'Overall rotation angle of the graphics',
    },
    {
      name: 'speed',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.speed,
      description: 'Animation speed',
    },
  ],
};
