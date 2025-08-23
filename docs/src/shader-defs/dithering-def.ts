import { ditheringPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = ditheringPresets[0].params;

export const ditheringDef: ShaderDef = {
  name: 'Dithering',
  description: '2-color dithering effect over animated abstract shapes.',
  params: [
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'The two colors used for the effect.',
    },
    {
      name: 'colorFront',
      type: 'string',
      defaultValue: defaultParams.colorFront,
      isColor: true,
      description: 'The two colors used for the effect.',
    },
    {
      name: 'pxSize',
      type: 'number',
      min: 1,
      max: 20,
      defaultValue: defaultParams.pxSize,
      description: 'Pixel size relative to canvas resolution.',
    },
    {
      name: 'shape',
      type: 'string',
      defaultValue: defaultParams.shape,
      description: 'Shape pattern type.',
      options: [
        { name: 'simplex', description: 'Simplex noise.' },
        { name: 'warp', description: 'Warp noise pattern.' },
        { name: 'dots', description: 'Columns of moving dots.' },
        { name: 'wave', description: 'Sine wave.' },
        { name: 'ripple', description: 'Ripple effect.' },
        { name: 'swirl', description: 'Swirl animation.' },
        { name: 'sphere', description: 'Rotating sphere.' },
      ],
    },
    {
      name: 'type',
      type: 'string',
      defaultValue: defaultParams.type,
      description: 'Dithering type.',
      options: [
        { name: 'random', description: 'Random dithering.' },
        { name: '2x2', description: '2x2 Bayer matrix.' },
        { name: '4x4', description: '4x4 Bayer matrix.' },
        { name: '8x8', description: '8x8 Bayer matrix.' },
      ],
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
