import type { ShaderDef } from './shader-def-types.js';
import { animatedCommonParams } from './common-param-def.js';

export const neuroNoiseDef: ShaderDef = {
  name: 'Neuro Noise',
  description:
    'A glowing, web-like structure of fluid lines and soft intersections. Great for creating atmospheric, organic-yet-futuristic visuals.',
  params: [
    {
      name: 'colorFront',
      type: 'string',
      isColor: true,
      defaultValue: '#ffffff',
      description: 'Graphics highlight color',
    },
    {
      name: 'colorMid',
      type: 'string',
      isColor: true,
      defaultValue: '#888888',
      description: 'Graphics main color',
    },
    {
      name: 'colorBack',
      type: 'string',
      isColor: true,
      defaultValue: '#000000',
      description: 'Background color',
    },
    {
      name: 'brightness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: 0.05,
      description: 'Luminosity of the crossing points',
    },
    {
      name: 'contrast',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: 0.3,
      description: 'Sharpness of the bright–dark transition',
    },
    ...animatedCommonParams,
    // Override common speed here
  ],
};
