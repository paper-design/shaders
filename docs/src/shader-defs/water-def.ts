import { waterPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import {animatedCommonParams, animatedImageCommonParams} from './common-param-def';

const defaultParams = waterPresets[0].params;

export const waterDef: ShaderDef = {
  name: 'Water',
  description:
    'Water-like surface distortion with natural caustic realism. Works as an image filter or animated texture without image.',
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
      name: 'colorHighlight',
      type: 'string',
      defaultValue: defaultParams.colorHighlight,
      isColor: true,
      description: 'Highlight color',
    },
    {
      name: 'highlights',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.highlights,
      description: 'A coloring added over the image/background, following the caustic shape',
    },
    {
      name: 'layering',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.layering,
      description: 'The power of 2nd layer of caustic distortion',
    },
    {
      name: 'edges',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.edges,
      description: 'Caustic distortion power on the image edges',
    },
    {
      name: 'waves',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.waves,
      description: 'Additional distortion based in simplex noise, independent from caustic',
    },
    {
      name: 'caustic',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.caustic,
      description: 'Power of caustic distortion',
    },
    {
      name: 'size',
      type: 'number',
      min: 0.01,
      max: 7,
      defaultValue: defaultParams.size,
      description: 'Pattern scale relative to the image',
    },
    ...animatedImageCommonParams,
  ],
};
