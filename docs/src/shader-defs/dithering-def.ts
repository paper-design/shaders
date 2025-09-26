import { ditheringPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = ditheringPresets[0].params;

export const ditheringDef: ShaderDef = {
  name: 'Dithering',
  description:
    'Animated 2-color dithering over with multiple pattern sources (noise, warp, dots, waves, ripple, swirl, sphere). Great for retro, print-like, or stylized UI textures.',
  params: [
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'colorFront',
      type: 'string',
      defaultValue: defaultParams.colorFront,
      isColor: true,
      description: 'The foreground (ink) color',
    },
    {
      name: 'shape',
      type: 'enum',
      defaultValue: defaultParams.shape,
      description: 'Shape pattern type',
      options: ['simplex', 'warp', 'dots', 'wave', 'ripple', 'swirl', 'sphere'],
    },
    {
      name: 'type',
      type: 'enum',
      defaultValue: defaultParams.type,
      description: 'Dithering type',
      options: ['random', '2x2', '4x4', '8x8'],
    },
    {
      name: 'size',
      type: 'number',
      min: 1,
      max: 20,
      defaultValue: defaultParams.size,
      description: 'Pixel size of dithering grid',
    },
    ...animatedCommonParams,
  ],
};
