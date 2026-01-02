import { grainGradientImagePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedImageCommonParams } from './common-param-def';

const defaultParams = grainGradientImagePresets[0].params;

export const grainGradientImageDef: ShaderDef = {
  name: 'Grain Gradient Image',
  description: 'Grainy, noise-textured distortion effect applied over an input image.',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description: 'The image to use for the effect',
    },
    {
      name: 'blend',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.blend,
      description: 'Controls distortion effect strength',
    },
    {
      name: 'intensity',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.intensity,
      description: 'Distortion intensity',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description: 'Grainy noise overlay',
    },
    ...animatedImageCommonParams,
  ],
};
