import { spiralPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = spiralPresets[0].params;

export const spiralDef: ShaderDef = {
  name: 'Spiral',
  description:
    'A single-colored animated spiral that morphs across a wide range of shapes - from crisp, thin-lined geometry to flowing whirlpool forms and wavy, abstract rings.',
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
      description: 'The color of spiral shape',
    },
    {
      name: 'density',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.density,
      description: 'Spacing falloff simulating perspective (0 = flat spiral)',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description: 'Power of shape distortion applied along the spiral',
    },
    {
      name: 'strokeWidth',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.strokeWidth,
      description: 'Thickness of spiral curve',
    },
    {
      name: 'strokeTaper',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.strokeTaper,
      description: 'how much the stroke is loosing width away from center (0 = full visibility)',
    },
    {
      name: 'strokeCap',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.strokeCap,
      description: 'Extra stroke width at the center (no effect with strokeWidth = 0.5)',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description: 'Noise distortion applied over the canvas (no effect with noiseFrequency = 0)',
    },
    {
      name: 'noiseFrequency',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noiseFrequency,
      description: 'Moise frequency (no effect with noise = 0)',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description: 'Color transition sharpness (0 = hard edge, 1 = smooth gradient)',
    },
    ...animatedCommonParams,
  ],
};
