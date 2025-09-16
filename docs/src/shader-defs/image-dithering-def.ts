import { imageDitheringPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = imageDitheringPresets[0].params;

export const imageDitheringDef: ShaderDef = {
  name: 'Image Dithering',
  description:
    'A dithering image filter with support for 4 dithering modes and multiple color palettes (2-color, 3-color, and multicolor options, using either predefined colors or ones sampled directly from the original image).',
  params: [
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
      name: 'colorHighlight',
      type: 'string',
      defaultValue: defaultParams.colorHighlight,
      isColor: true,
      description: 'The secondary foreground color (set it same as colorFront to get a classic 2-color dithering)',
    },
    {
      name: 'originalColors',
      type: 'boolean',
      defaultValue: defaultParams.originalColors,
      description: 'Use the original colors of the image',
      options: ['true', 'false'],
    },
    {
      name: 'type',
      type: 'enum',
      defaultValue: defaultParams.type,
      description: 'Dithering type',
      options: ['random', '2x2', '4x4', '8x8'],
    },
    {
      name: 'pxSize',
      type: 'number',
      min: 0.5,
      max: 20,
      defaultValue: defaultParams.pxSize,
      description: 'Pixel size of dithering grid',
    },
    {
      name: 'colorSteps',
      type: 'number',
      min: 1,
      max: 7,
      step: 1,
      defaultValue: defaultParams.colorSteps,
      description: 'Number of colors to use (applies to both color modes)',
    },
    {
      name: 'width',
      type: 'number | string',
      defaultValue: undefined,
      description: 'CSS width style of the shader element',
    },
    {
      name: 'height',
      type: 'number | string',
      defaultValue: undefined,
      description: 'CSS height style of the shader element',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.5,
      max: 10,
      defaultValue: defaultParams.scale,
      description: 'Overall zoom level of the graphics',
    },
    {
      name: 'fit',
      type: 'enum',
      defaultValue: defaultParams.fit,
      description: 'How the image fits the canvas',
      options: ['contain', 'cover'],
    },
  ],
};
