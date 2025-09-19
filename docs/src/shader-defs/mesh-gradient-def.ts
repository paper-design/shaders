import { meshGradientPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = meshGradientPresets[0].params;

export const meshGradientDef: ShaderDef = {
  name: 'Mesh Gradient',
  description:
    'A flowing interplay of color spots, moving along distinct trajectories and transformed by organic distortion.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 color spots',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description: 'The power of organic noise distortion',
    },
    {
      name: 'swirl',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.swirl,
      description: 'The power of vortex distortion',
    },
    {
      name: 'grainMixer',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainMixer,
      description: 'Strength of grain distortion applied to color edges',
    },
    {
      name: 'grainOverlay',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainOverlay,
      description: 'Post-processing RGB grain overlay',
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
      name: 'width',
      type: 'number | string',
      defaultValue: undefined,
      description: 'CSS width style of the shader element',
    },
    {
      name: 'height',
      type: 'number | string',
      defaultValue: undefined,
      description: 'CSS height style of the shader element',
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
