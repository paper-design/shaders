import { liquidMetalPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = liquidMetalPresets[0].params;

export const liquidMetalDef: ShaderDef = {
  name: 'Liquid Metal',
  description: 'Futuristic liquid metal material applied to uploaded logo or abstract shape.',
  params: [
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'colorTint',
      type: 'string',
      defaultValue: defaultParams.colorTint,
      isColor: true,
      description: 'Overlay color (color burn blending used)',
    },
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description: 'The image to use for the effect. We accept png and svg images (non-white shape on white or transparent background)',
    },
    {
      name: 'repetition',
      type: 'number',
      min: 1,
      max: 10,
      defaultValue: defaultParams.repetition,
      description: 'Density of pattern stripes',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description: 'Color transition sharpness (0 = hard edge, 1 = smooth gradient)',
    },
    {
      name: 'shiftRed',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.shiftRed,
      description: 'R-channel dispersion',
    },
    {
      name: 'shiftBlue',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.shiftBlue,
      description: 'B-channel dispersion',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description: 'Noise distortion over the stripes pattern',
    },
    {
      name: 'contour',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.contour,
      description: 'Strength of the distortion on the shape edges',
    },
    {
      name: 'suspendWhenProcessingImage',
      type: 'boolean',
      description: 'TODO',
      options: ['true', 'false'],
    },
    ...animatedCommonParams,
  ],
};
