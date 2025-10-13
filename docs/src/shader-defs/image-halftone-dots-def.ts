import { imageHalftoneDotsPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = imageHalftoneDotsPresets[0].params;

export const imageHalftoneDotsDef: ShaderDef = {
  name: 'Halftone Dots',
  description: 'TBD',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description: 'The image to use for the effect',
    },
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'TBD',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'size',
      type: 'number',
      min: 0.5,
      max: 20,
      defaultValue: defaultParams.size,
      description: 'TBD',
    },
    {
      name: 'radius',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.radius,
      description: 'TBD',
    },
    {
      name: 'contrast',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.contrast,
      description: 'TBD',
    },
    ...animatedCommonParams,
  ],
};
