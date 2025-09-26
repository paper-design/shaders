import { dotOrbitPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = dotOrbitPresets[0].params;

export const dotOrbitDef: ShaderDef = {
  name: 'Dot Orbit',
  description:
    'Animated multi-color dots pattern with each dot orbiting around its cell center. Supports up to 40 colors and various shape and motion controls. Great for playful, dynamic backgrounds and UI textures.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 base colors',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'stepsPerColor',
      type: 'number',
      min: 1,
      max: 4,
      step: 1,
      defaultValue: defaultParams.stepsPerColor,
      description:
        'Number of extra colors between base colors (1 = N color palette, 2 = 2×N color palette, 3 = 3×N color palette, etc)',
    },
    {
      name: 'size',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.size,
      description: 'Dot radius relative to cell size',
    },
    {
      name: 'sizeRange',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.sizeRange,
      description: 'Random variation in shape size (0 = uniform size, higher = random value up to base size)',
    },
    {
      name: 'spreading',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.spreading,
      description: 'Maximum orbit distance',
    },
    ...animatedCommonParams,
  ],
};
