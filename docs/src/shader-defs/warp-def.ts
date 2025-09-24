import { warpPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = warpPresets[0].params;

export const warpDef: ShaderDef = {
  name: 'Warp',
  description:
    'Animated color fields warped by noise and swirls, applied over base patterns (checks, stripes, or split edge). Blends up to 10 colors with adjustable distribution, softness, distortion, and swirl. Great for fluid, smoky, or marbled effects.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 colors in the gradient',
    },
    {
      name: 'proportion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.proportion,
      description: 'Blend point between 2 colors (0.5 = equal distribution)',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description: 'Color transition sharpness (0 = hard edge, 1 = smooth gradient)',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description: 'Strength of noise-based distortion',
    },
    {
      name: 'swirl',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.swirl,
      description: 'Strength of the swirl distortion',
    },
    {
      name: 'swirlIterations',
      type: 'number',
      min: 0,
      max: 20,
      defaultValue: defaultParams.swirlIterations,
      description: 'Number of layered swirl passes (effective with swirl > 0)',
    },
    {
      name: 'shape',
      type: 'enum',
      defaultValue: defaultParams.shape,
      description: 'Base pattern type',
      options: ['checks', 'stripes', 'edge'],
    },
    {
      name: 'shapeScale',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.shapeScale,
      description: 'Zoom level of the base pattern',
    },
    ...animatedCommonParams,
  ],
};
