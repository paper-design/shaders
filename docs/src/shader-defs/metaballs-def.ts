import { metaballsPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = metaballsPresets[0].params;

export const metaballsDef: ShaderDef = {
  name: 'Metaballs',
  description: 'Up to 20 gooey blobs moving around the center and merging into smooth organic shapes.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 8 base colors',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'count',
      type: 'number',
      min: 1,
      max: 20,
      defaultValue: defaultParams.count,
      description: 'Number of balls',
    },
    {
      name: 'size',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.size,
      description: 'The size of the balls',
    },
    ...animatedCommonParams,
  ],
};
