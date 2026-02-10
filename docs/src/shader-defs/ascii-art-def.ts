import { asciiArtPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticImageCommonParams } from './common-param-def';

const defaultParams = asciiArtPresets[0].params;

export const asciiArtDef: ShaderDef = {
  name: 'ASCII Art',
  description:
    'An ASCII art image filter that converts images into text characters. Uses a 6-region shape vector approach to match image cells to the best-fitting ASCII character based on spatial brightness patterns',
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
      description: 'Foreground (character) color',
    },
    {
      name: 'originalColors',
      type: 'boolean',
      defaultValue: defaultParams.originalColors,
      description: 'Use the sampled image\u2019s original colors instead of colorFront',
      options: ['true', 'false'],
    },
    {
      name: 'inverted',
      type: 'boolean',
      defaultValue: defaultParams.inverted,
      description:
        'Inverts the image luminance, doesn\u2019t affect the color scheme; not effective at zero contrast',
      options: ['true', 'false'],
    },
    {
      name: 'size',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.size,
      description: 'Character grid size relative to the image box',
    },
    {
      name: 'contrast',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.contrast,
      description: 'Contrast applied to the sampled image',
    },
    ...staticImageCommonParams,
  ],
};
