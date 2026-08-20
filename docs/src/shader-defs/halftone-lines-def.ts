import { halftoneLinesPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticImageCommonParams } from './common-param-def';

const defaultParams = halftoneLinesPresets[0].params;

export const halftoneLinesDef: ShaderDef = {
  name: 'Halftone lines',
  description:
    'Image filter pattern made of a line grid with optional stroke thickness and grid distortion; offering multiple grid types, grid distortions, and color palettes',
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
      description: 'Foreground color, needs originalColors off',
    },
    {
      name: 'originalColors',
      type: 'boolean',
      defaultValue: defaultParams.originalColors,
      description: 'Use the sampled image’s original colors instead of colorFront',
      options: ['true', 'false'],
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
      name: 'inverted',
      type: 'boolean',
      defaultValue: defaultParams.inverted,
      description: 'Inverts the image luminance, needs contrast > 0',
      options: ['true', 'false'],
    },
    {
      name: 'smoothness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.smoothness,
      description: 'Smoothing applied to the luminance that shapes the strokes; the image colors stay sharp',
    },
    {
      name: 'colorSmoothness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.colorSmoothness,
      description: 'Smoothing applied to the sampled image colors, needs originalColors on',
    },
    {
      name: 'strokeWidth',
      type: 'number',
      min: 0.05,
      max: 1,
      defaultValue: defaultParams.strokeWidth,
      description: 'Stroke width relative to the grid cell; at 1 the strokes fill the cell completely',
    },
    {
      name: 'softness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.softness,
      description:
        'Softness of the stroke edges as a fraction of the grid cell; at 1 the stripes blur out into flat tone',
    },
    {
      name: 'keepGaps',
      type: 'boolean',
      defaultValue: defaultParams.keepGaps,
      description: 'Keeps a two pixel gap between neighbouring strokes; off, they merge where they meet',
      options: ['true', 'false'],
    },
    {
      name: 'keepStrokes',
      type: 'boolean',
      defaultValue: defaultParams.keepStrokes,
      description: 'Keeps strokes at a two pixel minimum width; off, they fade away in the lightest areas',
      options: ['true', 'false'],
    },
    {
      name: 'grid',
      type: 'enum',
      defaultValue: defaultParams.grid,
      description: 'Grid type',
      options: ['lines', 'radial', 'waves', 'noise'],
    },
    {
      name: 'gridSize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.gridSize,
      description:
        'Grid size relative to the canvas (the grid lives in object space, so it does not follow the image box)',
    },
    {
      name: 'gridOffset',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.gridOffset,
      description:
        'Grid offset along the grid Y axis; one grid cell at either end for the lines and waves grids, canvas units for noise and for the radial distance from the image center to the ring center',
    },
    {
      name: 'gridRotation',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.gridRotation,
      description: 'The grid rotation around the image center, with the radial grid needs a nonzero grid offset',
    },
    {
      name: 'gridAngleDistortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.gridAngleDistortion,
      description:
        'Changing the grid rotation on the darker image areas, with the radial grid needs a nonzero grid offset',
    },
    {
      name: 'gridNoiseDistortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.gridNoiseDistortion,
      description: 'Applying noise to the grid on the darker image areas',
    },
    {
      name: 'grainMixer',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainMixer,
      description: 'Strength of grain distortion applied to strokes',
    },
    {
      name: 'grainMixerSize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainMixerSize,
      description: 'The scale applied to the grain distortion, needs grainMixer > 0',
    },
    {
      name: 'grainOverlay',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainOverlay,
      description: 'Post-processing b/w grainy overlay',
    },
    {
      name: 'grainOverlaySize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainOverlaySize,
      description: 'The scale applied to the grain overlay, needs grainOverlay > 0',
    },
    ...staticImageCommonParams,
  ],
};
