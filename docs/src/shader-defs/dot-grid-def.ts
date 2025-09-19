import { dotGridPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticCommonParams } from './common-param-def';

const defaultParams = dotGridPresets[0].params;

export const dotGridDef: ShaderDef = {
  name: 'Dot Grid',
  description: 'Static grid pattern made of circles, diamonds, squares or triangles.',
  params: [
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'colorFill',
      type: 'string',
      defaultValue: defaultParams.colorFill,
      isColor: true,
      description: 'Shape fill color',
    },
    {
      name: 'colorStroke',
      type: 'string',
      defaultValue: defaultParams.colorStroke,
      isColor: true,
      description: 'Shape stroke color',
    },
    {
      name: 'shape',
      type: 'enum',
      defaultValue: defaultParams.shape,
      description: 'The shape type',
      options: ['circle', 'diamond', 'square', 'triangle'],
    },
    {
      name: 'size',
      type: 'number',
      min: 1,
      max: 100,
      defaultValue: defaultParams.size,
      description: 'Base size of each shape, pixels',
    },
    {
      name: 'gapX',
      type: 'number',
      min: 2,
      max: 500,
      defaultValue: defaultParams.gapX,
      description: 'Pattern horizontal spacing, pixels',
    },
    {
      name: 'gapY',
      type: 'number',
      min: 2,
      max: 500,
      defaultValue: defaultParams.gapY,
      description: 'Pattern vertical spacing, pixels',
    },
    {
      name: 'strokeWidth',
      type: 'number',
      min: 0,
      max: 50,
      defaultValue: defaultParams.strokeWidth,
      description: 'The outline stroke width, pixels',
    },
    {
      name: 'sizeRange',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.sizeRange,
      description: 'Random variation in shape size (0 = uniform size, higher = random value up to base size)',
    },
    {
      name: 'opacityRange',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.opacityRange,
      description: 'Random variation in shape opacity (0 = all shapes opaque, higher = semi-transparent dots)',
    },
    ...staticCommonParams,
  ],
};
