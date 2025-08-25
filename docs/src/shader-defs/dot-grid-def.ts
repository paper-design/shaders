import { dotGridPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = dotGridPresets[0].params;

export const dotGridDef: ShaderDef = {
  name: 'Dot Grid',
  description: 'Static grid pattern.',
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
      name: 'size',
      type: 'number',
      min: 1,
      max: 100,
      defaultValue: defaultParams.size,
      description: 'Base shape size',
    },
    {
      name: 'gapX',
      type: 'number',
      min: 2,
      max: 500,
      defaultValue: defaultParams.gapX,
      description: 'Pattern spacing',
    },
    {
      name: 'gapY',
      type: 'number',
      min: 2,
      max: 500,
      defaultValue: defaultParams.gapY,
      description: 'Pattern spacing',
    },
    {
      name: 'strokeWidth',
      type: 'number',
      min: 0,
      max: 50,
      defaultValue: defaultParams.strokeWidth,
      description: 'The stroke (to be added to size)',
    },
    {
      name: 'sizeRange',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.sizeRange,
      description: 'Randomizes the size of shape between 0 and size',
    },
    {
      name: 'opacityRange',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.opacityRange,
      description: 'Variety of shape opacity',
    },
    {
      name: 'shape',
      type: 'enum',
      defaultValue: defaultParams.shape,
      description: 'The shape of the dots',
      options: ['circle', 'diamond', 'square', 'triangle'],
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.01,
      max: 4,
      defaultValue: defaultParams.scale,
      description: 'Overall zoom level of the graphics',
    },
    {
      name: 'rotation',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.rotation,
      description: 'Overall rotation angle of the graphics',
    },
  ],
};
