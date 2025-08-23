import { imageDitheringPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = imageDitheringPresets[0].params;

export const imageDitheringDef: ShaderDef = {
  name: 'Image Dithering',
  description: 'Dithering effect using a 3-color palette.',
  params: [
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Colors used for the effect.',
    },
    {
      name: 'colorFront',
      type: 'string',
      defaultValue: defaultParams.colorFront,
      isColor: true,
      description: 'Colors used for the effect.',
    },
    {
      name: 'colorHighlight',
      type: 'string',
      defaultValue: defaultParams.colorHighlight,
      isColor: true,
      description: 'Colors used for the effect.',
    },
    {
      name: 'originalColors',
      type: 'boolean',
      defaultValue: defaultParams.originalColors,
      description: 'Use the original colors of the image.',
      options: ['true', 'false'],
    },
    {
      name: 'type',
      type: 'string',
      defaultValue: defaultParams.type,
      description: 'Dithering type.',
      options: [
        { name: 'random', description: 'Random dithering.' },
        { name: '2x2', description: '2x2 Bayer matrix.' },
        { name: '4x4', description: '4x4 Bayer matrix.' },
        { name: '8x8', description: '8x8 Bayer matrix.' },
      ],
    },
    {
      name: 'pxSize',
      type: 'number',
      min: 0.5,
      max: 20,
      defaultValue: defaultParams.pxSize,
      description: 'Pixel size relative to canvas resolution.',
    },
    {
      name: 'colorSteps',
      type: 'number',
      min: 1,
      max: 7,
      step: 1,
      defaultValue: defaultParams.colorSteps,
      description: 'Number of colors to use (applies to both color modes).',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.5,
      max: 10,
      defaultValue: defaultParams.scale,
      description: 'Overall pattern zoom.',
    },
    {
      name: 'fit',
      type: 'string',
      defaultValue: defaultParams.fit,
      description: 'How the image fits the canvas.',
      options: ['contain', 'cover'],
    },
  ],
};
