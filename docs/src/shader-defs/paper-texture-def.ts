import { paperTexturePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import {staticCommonParams, staticImageCommonParams} from './common-param-def';

const defaultParams = paperTexturePresets[0].params;

export const paperTextureDef: ShaderDef = {
  name: 'Paper Texture',
  description:
    'A static texture built from multiple noise layers, usable for a realistic paper and cardboard surfaces or generating abstract patterns. Can be used as a image filter or as a texture.',
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
      description: 'The foreground color',
    },
    {
      name: 'contrast',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.contrast,
      description: 'Blending behavior (sharper vs. smoother color transitions)',
    },
    {
      name: 'roughness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.roughness,
      description: 'Pixel noise, related to canvas (not scalable)',
    },
    {
      name: 'fiber',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.fiber,
      description: 'Curly-shaped noise',
    },
    {
      name: 'fiberSize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.fiberSize,
      description: 'Curly-shaped noise scale',
    },
    {
      name: 'crumples',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.crumples,
      description: 'Cell-based crumple pattern',
    },
    {
      name: 'crumpleSize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.crumpleSize,
      description: 'Cell-based crumple pattern scale',
    },
    {
      name: 'folds',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.folds,
      description: 'Depth of the folds',
    },
    {
      name: 'foldCount',
      type: 'number',
      min: 1,
      max: 15,
      step: 1,
      defaultValue: defaultParams.foldCount,
      description: 'Number of folds (15 max)',
    },
    {
      name: 'fade',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.fade,
      description: 'Big-scale noise mask applied to the pattern',
    },
    {
      name: 'drops',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.drops,
      description: 'The visibility of speckle pattern',
    },
    {
      name: 'seed',
      type: 'number',
      min: 0,
      max: 1000,
      defaultValue: defaultParams.seed,
      description: 'Seed applied to folds, crumples and dots',
    },
    ...staticImageCommonParams,
  ],
};
