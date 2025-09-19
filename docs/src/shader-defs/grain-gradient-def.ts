import { grainGradientPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = grainGradientPresets[0].params;

export const grainGradientDef: ShaderDef = {
  name: 'Grain Gradient',
  description: 'Multi-color gradients with grainy, noise-textured distortion available in 7 animated abstract forms.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 7 colors used in the gradient',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
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
      name: 'intensity',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.intensity,
      description: 'Distortion between color bands',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description: 'Grainy noise overlay',
    },
    {
      name: 'shape',
      type: 'enum',
      defaultValue: defaultParams.shape,
      description: 'Shape type',
      options: ['wave', 'dots', 'truchet', 'corners', 'ripple', 'blob', 'sphere'],
    },
    ...animatedCommonParams,
  ],
};
