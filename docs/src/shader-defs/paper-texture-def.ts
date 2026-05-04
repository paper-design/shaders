import { paperTexturePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticImageCommonParams } from './common-param-def';

const defaultParams = paperTexturePresets[0].params;

export const paperTextureDef: ShaderDef = {
  name: 'Paper Texture',
  description:
    'A static texture built from multiple noise layers, usable for a realistic paper and cardboard surfaces. Can be used as a image filter or as a texture.',
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
      description: 'Foreground color',
    },
    ...staticImageCommonParams,
  ],
};
