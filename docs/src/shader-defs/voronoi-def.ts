import { voronoiPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = voronoiPresets[0].params;

export const voronoiDef: ShaderDef = {
  name: 'Voronoi',
  description: 'Double-pass Voronoi pattern cell edges.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Colors used for the effect.',
    },
    {
      name: 'colorGap',
      type: 'string',
      defaultValue: defaultParams.colorGap,
      isColor: true,
      description: 'Background and glow colors.',
    },
    {
      name: 'colorGlow',
      type: 'string',
      defaultValue: defaultParams.colorGlow,
      isColor: true,
      description: 'Background and glow colors.',
    },
    {
      name: 'stepsPerColor',
      type: 'number',
      min: 1,
      max: 3,
      step: 1,
      defaultValue: defaultParams.stepsPerColor,
      description: 'Discrete color steps between colors.',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 0.5,
      defaultValue: defaultParams.distortion,
      description: 'Max distance the cell center moves away from regular grid.',
    },
    {
      name: 'gap',
      type: 'number',
      min: 0,
      max: 0.1,
      defaultValue: defaultParams.gap,
      description: 'Width of the stroke between the cells.',
    },
    {
      name: 'glow',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.glow,
      description: 'Radial glow around each cell center.',
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
      max: 1,
      defaultValue: defaultParams.speed,
      description: 'Animation speed.',
    },
  ],
};
