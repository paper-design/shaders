import { waterPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = waterPresets[0].params;

export const waterDef: ShaderDef = {
  name: 'Water',
  description:
    'Water-like surface distortion with natural caustic realism. Works as an image filter or animated texture without image',
  params: [
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
      name: 'effectScale',
      type: 'number',
      min: 0.01,
      max: 7,
      defaultValue: defaultParams.effectScale,
      description: 'Pattern scale relative to the image',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.1,
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
    {
      name: 'speed',
      type: 'number',
      min: 0,
      max: 3,
      defaultValue: defaultParams.speed,
      description: 'Animation speed',
    },
  ],
};
