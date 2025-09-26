import { neuroNoisePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = neuroNoisePresets[0].params;

export const neuroNoiseDef: ShaderDef = {
  name: 'Neuro Noise',
  description:
    'A glowing, web-like structure of fluid lines and soft intersections. Great for creating atmospheric, organic-yet-futuristic visuals.',
  params: [
    {
      name: 'colorFront',
      type: 'string',
      defaultValue: defaultParams.colorFront,
      isColor: true,
      description: 'Graphics highlight color',
    },
    {
      name: 'colorMid',
      type: 'string',
      defaultValue: defaultParams.colorMid,
      isColor: true,
      description: 'Graphics main color',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'brightness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.brightness,
      description: 'Luminosity of the crossing points',
    },
    {
      name: 'contrast',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.contrast,
      description: 'Sharpness of the bright–dark transition',
    },
    ...animatedCommonParams,
  ],
};
