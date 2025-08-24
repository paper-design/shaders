import { grainGradientPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';

const defaultParams = grainGradientPresets[0].params;

export const grainGradientDef: ShaderDef = {
  name: 'Grain Gradient',
  description: 'Multi-color gradient with noise & grain over animated abstract shapes.',
  params: [
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color.',
    },
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Colors used for the effect.',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description: 'Color transition sharpness (0 = hard edge, 1 = smooth gradient).',
    },
    {
      name: 'intensity',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.intensity,
      description: 'Distortion between color bands.',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description: 'Grainy noise independent of softness.',
    },
    {
      name: 'shape',
      type: 'string',
      defaultValue: defaultParams.shape,
      description: 'Shape type.',
      options: [
        { name: 'wave', description: 'Single sine wave.' },
        { name: 'dots', description: 'Dots pattern.' },
        { name: 'truchet', description: 'Truchet pattern.' },
        { name: 'corners', description: '2 rounded rectangles.' },
        { name: 'ripple', description: 'Ripple effect.' },
        { name: 'blob', description: 'Metaballs.' },
        { name: 'sphere', description: 'Circle imitating a 3D look.' },
      ],
    },
    {
      name: 'offsetX',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.offsetX,
      description: 'Horizontal offset of the graphics center.',
    },
    {
      name: 'offsetY',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.offsetY,
      description: 'Vertical offset of the graphics center.',
    },
    {
      name: 'scale',
      type: 'number',
      min: 0.01,
      max: 4,
      defaultValue: defaultParams.scale,
      description: 'Overall zoom level of the graphics.',
    },
    {
      name: 'rotation',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.rotation,
      description: 'Overall rotation angle of the graphics.',
    },
    {
      name: 'speed',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.speed,
      description: 'Animation speed (requestAnimationFrame loop stops at speed=0).',
    },
  ],
};
