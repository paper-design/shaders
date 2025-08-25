import { grainGradientPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = grainGradientPresets[0].params;

export const grainGradientDef: ShaderDef = {
  name: 'Grain Gradient',
  description: 'Multi-color gradients with grainy, noise-textured distortion — available in 7 animated abstract forms',
  params: [
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 7 colors used in the gradient',
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
      name: 'intensity',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.intensity,
      description: 'Distortion between color bands',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description: 'Grainy noise overlay',
    },
    {
      name: 'shape',
      type: 'enum',
      defaultValue: defaultParams.shape,
      description: 'Shape type',
      options: ['wave', 'dots', 'truchet', 'corners', 'ripple', 'blob', 'sphere'],
    },
    {
      name: 'offsetX',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.offsetX,
      description: 'Horizontal offset of the graphics center',
    },
    {
      name: 'offsetY',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.offsetY,
      description: 'Vertical offset of the graphics center',
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
    {
      name: 'speed',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.speed,
      description: 'Animation speed',
    },
  ],
};
