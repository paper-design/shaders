import { warpLogoPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = warpLogoPresets[0].params;

export const warpLogoDef: ShaderDef = {
  name: 'Liquid Metal',
  description: 'Futuristic liquid metal material applied to uploaded logo or abstract shape.',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description:
        'An optional image used as an effect mask. A transparent background is required. If no image is provided, the shader defaults to one of the predefined shapes.',
    },
    ...animatedCommonParams,
  ],
};
