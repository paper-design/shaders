import { imageLiquidMetalPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = imageLiquidMetalPresets[0].params;

export const imageLiquidMetalDef: ShaderDef = {
  name: 'Image Liquid Metal',
  description: 'TODO',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description: 'The image to use for the effect',
    },
    ...animatedCommonParams,
  ],
};
