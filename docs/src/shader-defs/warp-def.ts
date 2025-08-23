import { warpPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = warpPresets[0].params;

export const warpDef: ShaderDef = {
  name: 'Warp',
  description:
    'Animated color fields warped by noise and swirls, applied over base patterns (checks, stripes, or split edge). Blends up to 10 colors with adjustable distribution, softness, distortion, and swirl. Great for fluid, smoky, or marbled effects',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 colors in the gradient.',
    },
    {
      name: 'proportion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.proportion,
      description: 'Balance point for blending colors.',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description: 'Smoothness of color transitions (0 = hard edge, 1 = soft blend).',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description: 'Strength of noise-based distortion.',
    },
    {
      name: 'swirl',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.swirl,
      description: 'Strength of the swirl distortion.',
    },
    {
      name: 'swirlIterations',
      type: 'number',
      min: 0,
      max: 20,
      defaultValue: defaultParams.swirlIterations,
      description: 'Number of layered swirl passes.',
    },
    {
      name: 'shape',
      type: 'string',
      defaultValue: defaultParams.shape,
      description: 'Base pattern type.',
      options: [
        { name: 'checks', description: 'Checkerboard.' },
        { name: 'stripes', description: 'Even stripes.' },
        { name: 'edge', description: 'Two halves split across the canvas.' },
      ],
    },
    {
      name: 'shapeScale',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.shapeScale,
      description: 'Zoom level of the base pattern.',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.01,
      max: 5,
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
      max: 20,
      defaultValue: defaultParams.speed,
      description: 'Animation speed.',
    },
  ],
};
