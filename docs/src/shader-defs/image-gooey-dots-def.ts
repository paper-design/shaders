import { imageGooeyDotsPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = imageGooeyDotsPresets[0].params;

export const imageGooeyDotsDef: ShaderDef = {
  name: 'Gooey Dots',
  description: 'TBD',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description: 'The image to use for the effect',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'colorFront',
      type: 'string',
      defaultValue: defaultParams.colorFront,
      isColor: true,
      description: 'The main foreground color',
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
      name: 'threshold',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.threshold,
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
