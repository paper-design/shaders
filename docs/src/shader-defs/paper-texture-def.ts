import { paperTexturePresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticImageCommonParams } from './common-param-def';

const defaultParams = paperTexturePresets[0].params;

export const paperTextureDef: ShaderDef = {
  name: 'Paper Texture',
  description:
    'Static texture built from a combination of grains, noises and fold patterns; works as an image filter or as a standalone texture',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description: 'The image over the paper texture; it can be blended into the texture and bend by it',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description:
        'The color behind the paper sheet, visible where clip cuts the image away, or through a semi-transparent colorPaper or colorShadow',
    },
    {
      name: 'colorPaper',
      type: 'string',
      defaultValue: defaultParams.colorPaper,
      isColor: true,
      description: 'The color of the paper sheet, can be blended into the image',
    },
    {
      name: 'colorShadow',
      type: 'string',
      defaultValue: defaultParams.colorShadow,
      isColor: true,
      description:
        'The color of the patterns (grain, fiber, crumples, wrinkles and folds) over the paper sheet, can be blended into the image',
    },
    {
      name: 'blending',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.blending,
      description:
        'Amount of image-to-paper blending (0 = original image color, 1 = image multiplied with the paper pattern), needs image',
    },
    {
      name: 'distortion',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.distortion,
      description:
        'How much the image bends with the paper surface; negative values bend it the opposite way (needs image)',
    },
    {
      name: 'clip',
      type: 'boolean',
      defaultValue: defaultParams.clip,
      description: 'Cuts the paper sheet to the image frame (needs image)',
    },
    {
      name: 'roughness',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.roughness,
      description: 'Fine grain covering the surface evenly',
    },
    {
      name: 'roughnessSize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.roughnessSize,
      description: 'Scale of the roughness grain (needs roughness > 0)',
    },
    {
      name: 'roughnessRows',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.roughnessRows,
      description:
        'Lines the roughness pattern up into stripes: 0 = even scatter, 1 = laid-paper rows; the rows run across the direction set by angle (needs roughness > 0)',
    },
    {
      name: 'fiber',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.fiber,
      description: 'Curly thread-like noise covering the surface evenly',
    },
    {
      name: 'fiberSize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.fiberSize,
      description: 'Scale of the fiber noise (needs fiber > 0)',
    },
    {
      name: 'crumples',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.crumples,
      description: 'A set of irregular folding lines, shaped by a combination of seed and angle values',
    },
    {
      name: 'crumpleCount',
      type: 'number',
      min: 2,
      max: 15,
      step: 1,
      defaultValue: defaultParams.crumpleCount,
      description: 'Number of facets in the crumple field (needs crumples > 0)',
    },
    {
      name: 'wrinkles',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.wrinkles,
      description:
        'A pattern of facets covering the surface evenly; the wrinkle lines visually resemble the crumple lines, but they repeat across the surface instead of being counted; wrinkles are shaped by a combination of seed and angle values',
    },
    {
      name: 'wrinkleSize',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.wrinkleSize,
      description: 'Scale of the wrinkle facets (needs wrinkles > 0)',
    },
    {
      name: 'folds',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.folds,
      description:
        'Straight vertical and horizontal fold lines producing ridges and valleys, depending on the angle value',
    },
    {
      name: 'foldSizeX',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.foldSizeX,
      description: 'Size of the vertical folds; higher values give fewer and wider folds (needs folds > 0)',
    },
    {
      name: 'foldSizeY',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.foldSizeY,
      description: 'Size of the horizontal folds; higher values give fewer and wider folds (needs folds > 0)',
    },
    {
      name: 'foldOffsetX',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.foldOffsetX,
      description: 'Shifts the vertical folds across the surface (needs folds > 0)',
    },
    {
      name: 'foldOffsetY',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.foldOffsetY,
      description: 'Shifts the horizontal folds across the surface (needs folds > 0)',
    },
    {
      name: 'angle',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.angle,
      description:
        'Direction the surface is lit from, clockwise from the top of the canvas; it also sets the direction of the roughness rows (needs crumples, wrinkles, folds, roughnessRows or drops > 0)',
    },
    {
      name: 'drops',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.drops,
      description:
        'Visibility of the speckle pattern; unlike the other patterns it darkens the image rather than adding a shape colored by colorShadow',
    },
    {
      name: 'seed',
      type: 'number',
      min: 0,
      max: 1000,
      defaultValue: defaultParams.seed,
      description: 'Seed applied to every pattern: crumples, wrinkles, folds, roughness, fiber and drops',
    },
    ...staticImageCommonParams,
  ],
};
