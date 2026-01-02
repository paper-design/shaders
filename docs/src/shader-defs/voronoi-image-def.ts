import { voronoiImagePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedImageCommonParams } from './common-param-def';

const defaultParams = voronoiImagePresets[0].params;

export const voronoiImageDef: ShaderDef = {
  name: 'Voronoi Image',
  description: 'Voronoi pattern where each cell samples its color from the image at the cell center',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description: 'The image to use for the effect',
    },
    {
      name: 'colorGap',
      type: 'string',
      defaultValue: defaultParams.colorGap,
      isColor: true,
      description: 'Color used for cell borders/gaps',
    },
    {
      name: 'gridScale',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.gridScale,
      description: 'Scale of the voronoi grid only, independent of image',
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
    ...animatedImageCommonParams,
  ],
};
