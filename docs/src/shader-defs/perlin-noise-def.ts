import { perlinNoisePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = perlinNoisePresets[0].params;

export const perlinNoiseDef: ShaderDef = {
  name: 'Perlin Noise',
  description: '3D Perlin noise.',
  params: [
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
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
      name: 'proportion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.proportion,
      description: 'Blend point between 2 colors (0.5 = equal distribution).',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description: 'Color transition sharpness (0 = hard edge, 1 = smooth fade).',
    },
    {
      name: 'octaveCount',
      type: 'number',
      min: 1,
      max: 8,
      step: 1,
      defaultValue: defaultParams.octaveCount,
      description: 'More octaves give more detailed patterns.',
    },
    {
      name: 'persistence',
      type: 'number',
      min: 0.3,
      max: 1,
      defaultValue: defaultParams.persistence,
      description: 'Roughness, falloff between octaves.',
    },
    {
      name: 'lacunarity',
      type: 'number',
      min: 1.5,
      max: 10,
      defaultValue: defaultParams.lacunarity,
      description: 'Frequency step, typically around 2. Defines how compressed the pattern is.',
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
      max: 0.5,
      defaultValue: defaultParams.speed,
      description: 'Animation speed.',
    },
  ],
};
