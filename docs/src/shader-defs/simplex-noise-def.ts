import { simplexNoisePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = simplexNoisePresets[0].params;

export const simplexNoiseDef: ShaderDef = {
  name: 'Simplex Noise',
  description: 'Color gradient mapped over a combination of 2 simplex noises.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Colors used for the effect.',
    },
    {
      name: 'stepsPerColor',
      type: 'number',
      min: 1,
      max: 10,
      step: 1,
      defaultValue: defaultParams.stepsPerColor,
      description: 'Discrete color steps between colors.',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description: 'Color transition sharpness (0 = hard edge, 1 = smooth fade).',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.01,
      max: 4,
      defaultValue: defaultParams.scale,
      description: 'Overall pattern zoom.',
    },
    {
      name: 'rotation',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.rotation,
      description: 'Overall pattern rotation angle.',
    },
    {
      name: 'speed',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.speed,
      description: 'Animation speed.',
    },
  ],
};
