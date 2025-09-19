import { flutedGlassPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticCommonParams } from './common-param-def';

const defaultParams = flutedGlassPresets[0].params;

export const flutedGlassDef: ShaderDef = {
  name: 'Fluted Glass',
  description:
    'Fluted glass image filter transforms an image into streaked, ribbed distortions, giving a mix of clarity and obscurity.',
  params: [
    {
      name: 'image',
      type: 'string | HTMLImageElement',
      description: 'The image to use for the effect',
    },
    {
      name: 'count',
      type: 'number',
      min: 4,
      max: 200,
      step: 1,
      defaultValue: defaultParams.count,
      description: 'Number of grid lines',
    },
    {
      name: 'shape',
      type: 'enum',
      defaultValue: defaultParams.shape,
      description: 'The shape of the grid',
      options: ['pattern', 'wave', 'lines', 'linesIrregular', 'zigzag'],
    },
    {
      name: 'angle',
      type: 'number',
      min: 0,
      max: 180,
      defaultValue: defaultParams.angle,
      description: 'Direction of the grid relative to the image',
    },
    {
      name: 'distortionShape',
      type: 'enum',
      defaultValue: defaultParams.distortionShape,
      description: 'The shape of the distortion',
      options: ['prism', 'lens', 'contour', 'cascade', 'facete'],
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description: 'The power of distortion applied within each stripe',
    },
    {
      name: 'shift',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.shift,
      description: 'Texture shift in direction opposite to the grid',
    },
    {
      name: 'blur',
      type: 'number',
      min: 0,
      max: 50,
      defaultValue: defaultParams.blur,
      description: 'One-directional blur',
    },
    {
      name: 'highlights',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.highlights,
      description: 'Thin highlights along the grid lines',
    },
    {
      name: 'marginLeft',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.marginLeft,
      description: 'Showing original image on the left',
    },
    {
      name: 'marginRight',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.marginRight,
      description: 'Showing original image on the right',
    },
    {
      name: 'marginTop',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.marginTop,
      description: 'Showing original image on the top',
    },
    {
      name: 'marginBottom',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.marginBottom,
      description: 'Showing original image on the bottom',
    },
    ...staticCommonParams,
  ],
};
