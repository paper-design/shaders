import { neuroNoisePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = neuroNoisePresets[0].params;

export const neuroNoiseDef: ShaderDef = {
  name: 'Neuro Noise',
  description: 'Fractal-like structure made of several layers of sine arches.',
  params: [
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color.',
    },
    {
      name: 'colorMid',
      type: 'string',
      defaultValue: defaultParams.colorMid,
      isColor: true,
      description: 'Graphics main color.',
    },
    {
      name: 'colorFront',
      type: 'string',
      defaultValue: defaultParams.colorFront,
      isColor: true,
      description: 'Graphics highlight color.',
    },
    {
      name: 'brightness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.brightness,
      description: 'Brightness.',
    },
    {
      name: 'contrast',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.contrast,
      description: 'Contrast.',
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
