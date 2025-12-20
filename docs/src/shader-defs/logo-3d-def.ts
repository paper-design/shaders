import { logo3dPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = logo3dPresets[0].params;

export const logo3dDef: ShaderDef = {
  name: '3d Logo',
  description: 'TBD',
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
