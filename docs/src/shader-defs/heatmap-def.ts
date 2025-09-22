import { heatmapPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = heatmapPresets[0].params;

export const heatmapDef: ShaderDef = {
  name: 'Heatmap',
  description: 'TODO',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 colors used to color the heatmap',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'contour',
      type: 'number',
      defaultValue: defaultParams.contour,
      min: 0,
      max: 1,
      description: 'TODO',
    },
    {
      name: 'angle',
      type: 'number',
      defaultValue: defaultParams.angle,
      min: 0,
      max: 360,
      description: 'TODO',
    },
    {
      name: 'noise',
      type: 'number',
      defaultValue: defaultParams.noise,
      min: 0,
      max: 1,
      description: 'TODO',
    },
    {
      name: 'innerGlow',
      type: 'number',
      defaultValue: defaultParams.innerGlow,
      min: 0,
      max: 1,
      description: 'TODO',
    },
    {
      name: 'outerGlow',
      type: 'number',
      defaultValue: defaultParams.outerGlow,
      min: 0,
      max: 1,
      description: 'TODO',
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
