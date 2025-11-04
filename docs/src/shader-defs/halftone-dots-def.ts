import { halftoneDotsPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticCommonParams } from './common-param-def';

const defaultParams = halftoneDotsPresets[0].params;

export const halftoneDotsDef: ShaderDef = {
  name: 'Halftone Dots',
  description: 'A halftone-dots image filter for creating customizable graphic patterns with adjustable colors, grid types, and both classic and playful dot styles',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description: 'The image to use for the effect',
    },
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
      description: 'The main foreground color',
    },
    {
      name: 'originalColors',
      type: 'boolean',
      defaultValue: defaultParams.originalColors,
      description: 'Use the sampled image’s original colors instead of colorBack and colorFront',
      options: ['true', 'false'],
    },
    {
      name: 'type',
      type: 'enum',
      defaultValue: defaultParams.type,
      description: 'Dot style',
      options: ['classic', 'gooey', 'holes', 'soft'],
    },
    {
      name: 'inverted',
      type: 'boolean',
      defaultValue: defaultParams.originalColors,
      description: 'Inverts the dot shape. Doesn’t affect the color scheme; not effective at zero contrast',
      options: ['true', 'false'],
    },
    {
      name: 'straight',
      type: 'boolean',
      defaultValue: defaultParams.originalColors,
      description: 'Use a straight grid (disable for diagonal)',
      options: ['true', 'false'],
    },
    {
      name: 'size',
      type: 'number',
      min: 4,
      max: 60,
      defaultValue: defaultParams.size,
      description: 'Grid-cell size',
    },
    {
      name: 'radius',
      type: 'number',
      min: 0,
      max: 2,
      defaultValue: defaultParams.radius,
      description: 'Maximum dot size (relative to the grid cell)',
    },
    {
      name: 'contrast',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.contrast,
      description: 'Contrast applied to the sampled image',
    },
    {
      name: 'grainMixer',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainMixer,
      description: 'Strength of grain distortion applied to shape edges',
    },
    {
      name: 'grainOverlay',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainOverlay,
      description: 'Post-processing grainy overlay (hard light blending)',
    },
    ...staticCommonParams,
  ],
};
