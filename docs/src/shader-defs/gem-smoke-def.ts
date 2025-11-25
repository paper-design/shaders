import { gemSmokePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = gemSmokePresets[0].params;

export const gemSmokeDef: ShaderDef = {
  name: 'Gem Smoke',
  description: 'Fluid, smoke shape animating behind the input image and being distorted by shape',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description:
        'An optional image used as an effect mask. A transparent background is required. If no image is provided, the shader defaults to one of the predefined shapes.',
    },
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
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description: 'The power of smoke distortion',
    },
    {
      name: 'outerDistortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.outerDistortion,
      description: 'The power of distortion out of the input shape (shape defined by alpha channel)',
    },
    {
      name: 'outerVisibility',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.outerDistortion,
      description: 'The visibility of smoke shape out of the input shape (shape defined by alpha channel)',
    },
    {
      name: 'innerFill',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.innerFill,
      description: 'Additional flat color within the input shape (shape defined by alpha channel)',
    },
    ...animatedCommonParams,
  ],
};
