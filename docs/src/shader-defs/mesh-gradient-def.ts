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
      description: 'Horizontal offset of the graphics center.',
    },
    {
      name: 'offsetY',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.offsetY,
      description: 'Vertical offset of the graphics center.',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.01,
      max: 4,
      defaultValue: defaultParams.scale,
      description: 'Overall zoom level of the graphics.',
    },
    {
      name: 'rotation',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.rotation,
      description: 'Overall rotation angle of the graphics.',
    },
    {
      name: 'speed',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.speed,
      description: 'Animation speed (requestAnimationFrame loop stops at speed=0).',
    },
  ],
};
