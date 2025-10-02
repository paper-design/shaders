import { imageLiquidMetalPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = imageLiquidMetalPresets[0].params;

export const imageLiquidMetalDef: ShaderDef = {
  name: 'Image Liquid Metal',
  description: 'TODO',
  params: [
    // {
    //   name: 'colorBack',
    //   type: 'string',
    //   defaultValue: defaultParams.colorBack,
    //   isColor: true,
    //   description: 'Background color',
    // },
    // {
    //   name: 'colorTint',
    //   type: 'string',
    //   defaultValue: defaultParams.colorTint,
    //   isColor: true,
    //   description: 'Overlay color',
    // },
    // {
    //   name: 'image',
    //   type: 'HTMLImageElement | string',
    //   description: 'The image to use for the effect',
    // },
    // {
    //   name: 'edge',
    //   type: 'number',
    //   description: 'TODO',
    //   min: 0,
    //   max: 1,
    //   defaultValue: defaultParams.edge,
    // },
    // {
    //   name: 'distortion',
    //   type: 'number',
    //   description: 'TODO',
    //   min: 0,
    //   max: 1,
    //   defaultValue: defaultParams.distortion,
    // },
    // {
    //   name: 'softness',
    //   type: 'number',
    //   description: 'TODO',
    //   min: 0,
    //   max: 1,
    //   defaultValue: defaultParams.softness,
    // },
    // {
    //   name: 'shiftRed',
    //   type: 'number',
    //   min: -1,
    //   max: 1,
    //   defaultValue: defaultParams.shiftRed,
    //   description: 'R-channel dispersion',
    // },
    // {
    //   name: 'shiftBlue',
    //   type: 'number',
    //   min: -1,
    //   max: 1,
    //   defaultValue: defaultParams.shiftBlue,
    //   description: 'B-channel dispersion',
    // },
    // {
    //   name: 'repetition',
    //   type: 'number',
    //   description: 'TODO',
    //   min: 1,
    //   max: 10,
    //   defaultValue: defaultParams.repetition,
    // },
    // {
    //   name: 'suspendWhenProcessingImage',
    //   type: 'boolean',
    //   description: 'TODO',
    //   options: ['true', 'false'],
    // },
    ...animatedCommonParams,
  ],
};
