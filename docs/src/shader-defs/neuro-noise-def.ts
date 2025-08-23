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
      description: 'Colors used for the effect.',
    },
    {
      name: 'colorMid',
      type: 'string',
      defaultValue: defaultParams.colorMid,
      isColor: true,
      description: 'Colors used for the effect.',
    },
    {
      name: 'colorFront',
      type: 'string',
      defaultValue: defaultParams.colorFront,
      isColor: true,
      description: 'Colors used for the effect.',
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
