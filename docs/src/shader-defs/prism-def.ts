import { prismPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticImageCommonParams } from './common-param-def';

const defaultParams = prismPresets[0].params;

export const prismDef: ShaderDef = {
  name: 'Prism',
  description:
    'Prism image filter that samples an image several times along a dispersion axis and gives each sample its own color, the way glass refracts each wavelength by a different amount. The palette is what the image splits into.',
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
      description:
        "Color filling the picture's transparent areas and everything past its edge. A transparent value leaves those areas transparent with a colored rim; an opaque one lets a black-on-transparent logo read as a dark subject and split into the full palette",
    },
    {
      name: 'colorSteps',
      type: 'number',
      min: 2,
      max: 40,
      step: 1,
      defaultValue: defaultParams.colorSteps,
      description:
        'Number of colors the image splits into, which also sets how many samples are taken, so higher counts smooth a distortion from discrete ghosts into a continuous blur. Three gives a classic lens fringe, two an opposed pair, eight a full spectrum. The colors are always evenly spaced hues, so they cover the wheel at any count',
    },
    {
      name: 'hue',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.hue,
      description:
        'Turns the whole palette around the hue wheel. At three colors, 0 gives red/green/blue and 180 gives cyan/magenta/yellow. The colors work subtractively like ink, so these are the fringes you get on a dark subject over a light ground, and their complements on a light subject over a dark one',
    },
    {
      name: 'shift',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.shift,
      description: 'How far the outermost samples travel apart, up to 10% of the image width',
    },
    {
      name: 'shiftBias',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.shiftBias,
      description:
        'Warps how the colors distribute along the shift. 0 spaces them evenly; toward +/-1 they bunch toward one end of the fan and spread out at the other, with the first and last colors pinned at the ends',
    },
    {
      name: 'angle',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.angle,
      description: 'Direction of the shift in degrees when it is not radial',
    },
    {
      name: 'radiality',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.radiality,
      description:
        'Blends the shift from the fixed angle (0) to an outward-from-centre shift that grows with radius (1). At 0 every pixel shifts the same way; raising it adds the off-axis shift a straight angle never had, until at 1 the shift radiates from the centre and rounds off at the edges',
    },
    {
      name: 'centerFalloff',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.centerFalloff,
      description:
        'How much the shift strength drops toward the centre. 0 leaves it full everywhere; 1 fades it to nothing at the centre, which is what makes a radial split grow from the middle outward',
    },
    {
      name: 'edgeFalloff',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.edgeFalloff,
      description:
        'How much the shift strength drops toward the edge. 0 leaves it full; 1 fades it to nothing at the edge, rounding the effect into a centred disc',
    },
    {
      name: 'distortion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.distortion,
      description:
        'Fisheye warp of the image geometry, separate from the color shift. 0 leaves it flat; 1 is a full fisheye bulge that magnifies the centre, bows straight lines outward, and lets the corners run off into the background',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description:
        'Turbulence added to the shift direction on top of the chosen shape, turning a clean split into a scattered one without changing how far the colors travel',
    },
    {
      name: 'noiseFrequency',
      type: 'number',
      min: 0,
      max: 20,
      defaultValue: defaultParams.noiseFrequency,
      description: 'Spatial frequency of the turbulence field; higher values give a finer, busier scatter',
    },
    {
      name: 'noiseOffset',
      type: 'number',
      min: 0,
      max: 10,
      defaultValue: defaultParams.noiseOffset,
      description: 'Slides the turbulence field to a different patch, for a different random-looking pattern at the same settings',
    },
    ...staticImageCommonParams,
  ],
};
