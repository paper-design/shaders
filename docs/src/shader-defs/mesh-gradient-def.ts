import { meshGradientPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = meshGradientPresets[0].params;

export const meshGradientDef: ShaderDef = {
  name: 'Mesh Gradient',
  description:
    'A composition of N color spots (one per color) with 2 types of distortions applied to the coordinate space.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Colors used for the effect.',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description: 'Warp distortion.',
    },
    {
      name: 'swirl',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.swirl,
      description: 'Vortex distortion.',
    },
    {
      name: 'offsetX',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.offsetX,
      description: 'Position of the center.',
    },
    {
      name: 'offsetY',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.offsetY,
      description: 'Position of the center.',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.01,
      max: 4,
      defaultValue: defaultParams.scale,
      description: 'Overall pattern zoom.',
    },
    {
      name: 'rotation',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.rotation,
      description: 'Overall pattern rotation angle.',
    },
    {
      name: 'speed',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.speed,
      description: 'Animation speed.',
    },
  ],
};
