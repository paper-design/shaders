import { staticRadialGradientPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticCommonParams } from './common-param-def';

const defaultParams = staticRadialGradientPresets[0].params;

export const staticRadialGradientDef: ShaderDef = {
  name: 'Static Radial Gradient',
  description:
    'Radial gradient with up to 10 blended colors, featuring advanced focal point control, shape distortion, and grain effects.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 10 colors used in the gradient',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'radius',
      type: 'number',
      min: 0,
      max: 3,
      defaultValue: defaultParams.radius,
      description: 'The size of the shape',
    },
    {
      name: 'focalDistance',
      type: 'number',
      min: 0,
      max: 3,
      defaultValue: defaultParams.focalDistance,
      description: 'Distance of the focal point from center',
    },
    {
      name: 'falloff',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.falloff,
      description: 'Gradient decay (0 for linear gradient)',
    },
    {
      name: 'focalAngle',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.focalAngle,
      description: 'Angle of the focal point in degrees (effective with focalDistance > 0)',
    },
    {
      name: 'mixing',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.mixing,
      description: 'Blending behavior (sharper vs. smoother color transitions)',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description: 'Strength of radial distortion',
    },
    {
      name: 'distortionShift',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.distortionShift,
      description: 'Radial distortion offset (effective with distortion > 0)',
    },
    {
      name: 'distortionFreq',
      type: 'number',
      min: 0,
      max: 20,
      step: 1,
      defaultValue: defaultParams.distortionFreq,
      description: 'Radial distortion frequency (effective with distortion > 0)',
    },
    {
      name: 'grainMixer',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainMixer,
      description: 'Strength of grain distortion applied to color edges',
    },
    {
      name: 'grainOverlay',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainOverlay,
      description: 'Post-processing RGB grain overlay',
    },
    ...staticCommonParams,
  ],
};
