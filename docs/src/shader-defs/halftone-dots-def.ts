import { halftoneDotsPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import {staticCommonParams, staticImageCommonParams} from './common-param-def';

const defaultParams = halftoneDotsPresets[0].params;

export const halftoneDotsDef: ShaderDef = {
  name: 'Halftone Dots',
  description: 'A halftone-dot image filter featuring customizable grids, color palettes, and dot styles',
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
      defaultValue: defaultParams.inverted,
      description: 'Inverts the dot shape. Doesn’t affect the color scheme; not effective at zero contrast',
      options: ['true', 'false'],
    },
    {
      name: 'grid',
      type: 'enum',
      defaultValue: defaultParams.grid,
      description: 'Dots grid type',
      options: ['square', 'hex'],
    },
    {
      name: 'size',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.size,
      description: 'Grid size relative to the image box',
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
    {
      name: 'grainSize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainSize,
      description: 'The scale applied to both grain distortion and grain overlay',
    },
    ...staticImageCommonParams,
  ],
};
