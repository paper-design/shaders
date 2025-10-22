import { smokeRingPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = smokeRingPresets[0].params;

export const smokeRingDef: ShaderDef = {
  name: 'Smoke Ring',
  description: 'Radial multi-colored gradient shaped with layered noise for a natural, smoky aesthetic.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 colors used for the gradient',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'thickness',
      type: 'number',
      min: 0.01,
      max: 1,
      defaultValue: defaultParams.thickness,
      description: 'The thickness of the ring shape',
    },
    {
      name: 'radius',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.radius,
      description: 'The radius of the ring shape',
    },
    {
      name: 'innerShape',
      type: 'number',
      min: 0,
      max: 4,
      defaultValue: defaultParams.innerShape,
      description: 'The ring inner fill',
    },
    {
      name: 'noiseIterations',
      type: 'number',
      min: 1,
      max: 8,
      step: 1,
      defaultValue: defaultParams.noiseIterations,
      description: 'A number of noise layers, more layers gives more details',
    },
    {
      name: 'noiseScale',
      type: 'number',
      min: 0.01,
      max: 5,
      defaultValue: defaultParams.noiseScale,
      description: 'The noise frequency',
    },
    ...animatedCommonParams,
  ],
};
