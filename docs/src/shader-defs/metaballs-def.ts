import { metaballsPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = metaballsPresets[0].params;

export const metaballsDef: ShaderDef = {
  name: 'Metaballs',
  description: 'Up to 20 gooey blobs moving around the center and merging into smooth organic shapes',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 8 base colors',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'count',
      type: 'number',
      min: 1,
      max: 20,
      defaultValue: defaultParams.count,
      description: 'Number of balls',
    },
    {
      name: 'size',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.size,
      description: 'The size of the balls',
    },
    {
      name: 'offsetX',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.offsetX,
      description: 'Horizontal offset of the graphics center',
    },
    {
      name: 'offsetY',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.offsetY,
      description: 'Vertical offset of the graphics center',
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
    {
      name: 'speed',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.speed,
      description: 'Animation speed',
    },
  ],
};
