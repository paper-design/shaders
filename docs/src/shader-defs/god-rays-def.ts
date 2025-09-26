import { godRaysPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = godRaysPresets[0].params;

export const godRaysDef: ShaderDef = {
  name: 'God Rays',
  description:
    'Animated rays of light radiating from the center, blended with up to 5 colors. The rays are adjustable by size, density, brightness and center glow. Great for dramatic backgrounds, logo reveals, and VFX like energy bursts or sun shafts.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 5 ray colors',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'colorBloom',
      type: 'string',
      defaultValue: defaultParams.colorBloom,
      isColor: true,
      description: 'Color overlay blended with the rays',
    },
    {
      name: 'bloom',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.bloom,
      description: 'Strength of the bloom/overlay effect',
    },
    {
      name: 'intensity',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.intensity,
      description: 'Visibility/strength of the rays',
    },
    {
      name: 'density',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.density,
      description: 'The number of rays',
    },
    {
      name: 'spotty',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.spotty,
      description: 'The length of the rays',
    },
    {
      name: 'midSize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.midSize,
      description: 'Size of the circular glow shape in the center',
    },
    {
      name: 'midIntensity',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.midIntensity,
      description: 'Brightness/intensity of the central glow',
    },
    ...animatedCommonParams,
  ],
};
