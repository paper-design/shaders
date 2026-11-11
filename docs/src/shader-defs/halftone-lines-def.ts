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
      name: 'colorMid',
      type: 'string',
      defaultValue: defaultParams.colorMid,
      isColor: true,
      description:
        'Stroke color drawn in the light image areas, blending into colorFront in the dark ones, needs originalColors off',
    },
    {
      name: 'colorFront',
      type: 'string',
      defaultValue: defaultParams.colorFront,
      isColor: true,
      description:
        'Foreground color drawn in the dark image areas, blending into colorMid in the light ones, needs originalColors off',
    },
    {
      name: 'originalColors',
      type: 'boolean',
      defaultValue: defaultParams.originalColors,
      description: 'Use the sampled image’s original colors instead of colorMid and colorFront',
      options: ['true', 'false'],
    },
    {
      name: 'colorSoftness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.colorSoftness,
      description:
        'Blur applied to the sampled color, softening the image colors with originalColors on and the colorMid to colorFront edge with it off (at 0 the two colors meet on a sharp line)',
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
      name: 'strokeContrast',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.strokeContrast,
      description: 'How strongly the image luminance varies the stroke width',
    },
    {
      name: 'strokesRounding',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.strokesRounding,
      description: 'Smoothing applied to the luminance that shapes the strokes; the image colors stay sharp',
    },
    {
      name: 'strokeInverted',
      type: 'boolean',
      defaultValue: defaultParams.strokeInverted,
      description:
        'Inverts the image luminance driving the stroke width, leaving the colors and the grid contouring unchanged, needs strokeContrast > 0',
      options: ['true', 'false'],
    },
    {
      name: 'strokeSoftness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.strokeSoftness,
      description:
        'Softness added at the stroke edges, the same width at any stroke width; the stroke core keeps its full color and the stroke grows outward by the softness',
    },
    {
      name: 'strokeKeepGaps',
      type: 'boolean',
      defaultValue: defaultParams.strokeKeepGaps,
      description:
        'Keeps a thin gap between neighbouring strokes, two pixels wide and picking up a third of the stroke softness; off lets them merge where they meet',
      options: ['true', 'false'],
    },
    {
      name: 'strokeKeepWidth',
      type: 'boolean',
      defaultValue: defaultParams.strokeKeepWidth,
      description:
        'Draws a thin line along the grid where the strokes fade out, two pixels wide and picking up a third of the stroke softness; off lets them fade away in the lightest areas',
      options: ['true', 'false'],
    },
    {
      name: 'gridType',
      type: 'enum',
      defaultValue: defaultParams.gridType,
      description: 'Grid type',
      options: ['lines', 'linesIrregular', 'waves', 'wavesIrregular', 'zigzag', 'truchet', 'radial'],
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
        'Grid offset along the grid Y axis; one grid cell at either end for the lines and waves grids, canvas units for the radial distance from the image center to the ring center, and a quarter of that for noise',
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
      name: 'gridNoise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.gridNoise,
      description: 'Noise displacement of the grid along its Y axis',
    },
    {
      name: 'gridContouring',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.gridContouring,
      description:
        'How much the image contours the grid, blending an offset along the grid Y axis, a rotation around the image center and a noise displacement in proportion to gridOffset, gridRotation and gridNoise (-1 follows the light areas, 1 the dark ones, 0 is off), independent of strokeContrast',
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
