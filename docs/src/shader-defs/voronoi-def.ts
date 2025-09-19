import { voronoiPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = voronoiPresets[0].params;

export const voronoiDef: ShaderDef = {
  name: 'Voronoi',
  description: 'Anti-aliased animated Voronoi pattern with smooth and customizable edges.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Base cell colors (up to 10)',
    },
    {
      name: 'colorGlow',
      type: 'string',
      defaultValue: defaultParams.colorGlow,
      isColor: true,
      description: 'Color tint for the radial inner shadow effect inside cells (effective with glow > 0)',
    },
    {
      name: 'colorGap',
      type: 'string',
      defaultValue: defaultParams.colorGap,
      isColor: true,
      description: 'Color used for cell borders/gaps',
    },
    {
      name: 'stepsPerColor',
      type: 'number',
      min: 1,
      max: 3,
      step: 1,
      defaultValue: defaultParams.stepsPerColor,
      description:
        'Number of extra colors between base colors (1 = N color palette, 2 = 2×N color palette, 3 = 3×N color palette, etc)',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 0.5,
      defaultValue: defaultParams.distortion,
      description: 'Strength of noise-driven displacement of cell centers',
    },
    {
      name: 'gap',
      type: 'number',
      min: 0,
      max: 0.1,
      defaultValue: defaultParams.gap,
      description: 'Width of the border/gap between cells',
    },
    {
      name: 'glow',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.glow,
      description: 'Strength of the radial inner shadow inside cells',
    },
    ...animatedCommonParams,
  ],
};
