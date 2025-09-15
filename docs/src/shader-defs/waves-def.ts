import { wavesPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = wavesPresets[0].params;

export const wavesDef: ShaderDef = {
  name: 'Waves',
  description: 'Static line pattern configurable into textures ranging from sharp zigzags to smooth flowing waves.',
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
      description: 'The color of wavy lines',
    },
    {
      name: 'amplitude',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.amplitude,
      description: 'Wave amplitude',
    },
    {
      name: 'frequency',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.frequency,
      description: 'Wave frequency',
    },
    {
      name: 'spacing',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.spacing,
      description: 'The space between every two wavy lines',
    },
    {
      name: 'proportion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.proportion,
      description: 'Blend point between front and back colors (0.5 = equal distribution)',
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
      name: 'shape',
      type: 'number',
      min: 0,
      max: 3,
      defaultValue: defaultParams.shape,
      description:
        'Line shape control: zigzag at 0, sine at 1, irregular waves at 2. Intermediate values morph gradually between these shapes',
    },
    {
      name: 'width',
      type: 'number | string',
      defaultValue: undefined,
      description: 'CSS width style of the shader element',
    },
    {
      name: 'height',
      type: 'number | string',
      defaultValue: undefined,
      description: 'CSS height style of the shader element',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.01,
      max: 4,
      defaultValue: defaultParams.scale,
      description: 'Overall zoom level of the graphics',
    },
    {
      name: 'rotation',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.rotation,
      description: 'Overall rotation angle of the graphics',
    },
  ],
};
