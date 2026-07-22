import { lensDistortionPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticImageCommonParams } from './common-param-def';

const defaultParams = lensDistortionPresets[0].params;

export const lensDistortionDef: ShaderDef = {
  name: 'Lens Distortion',
  description:
    'Lens Distortion image filter that samples an image several times along a dispersion axis and gives each sample its own color, the way glass refracts each wavelength by a different amount. The palette is what the image splits into.',
  params: [
    {
      name: 'image',
      type: 'HTMLImageElement | string',
      description: 'The image to use for the effect',
    },
    {
      name: 'spread',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.spread,
      description: 'How far the outermost samples travel apart, up to 10% of the image width',
    },
    {
      name: 'spreadBias',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.spreadBias,
      description:
        'Warps how the colors distribute along the spread. 0 spaces them evenly; toward +/-1 they bunch toward one end of the fan and spread out at the other, with the first and last colors pinned at the ends',
    },
    {
      name: 'spreadAngle',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.spreadAngle,
      description: 'Direction of the spread in degrees when it is not radial',
    },
    {
      name: 'spreadPerspective',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.spreadPerspective,
      description:
        'Blends the spread from the fixed angle (0) to an outward-from-centre spread that grows with radius (1). At 0 every pixel shifts the same way; raising it adds the off-axis spread a straight angle never had, until at 1 the spread radiates from the centre and rounds off at the edges',
    },
    {
      name: 'samples',
      type: 'number',
      min: 2,
      max: 40,
      step: 1,
      defaultValue: defaultParams.samples,
      description:
        'Number of taps taken along the spread. Higher counts smooth the layers from discrete ghosts into a continuous blur, at a cost that grows linearly. This is the quality/smoothness dial',
    },
    {
      name: 'colorRange',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.colorRange,
      description:
        'How many colors the samples are grouped into, as a geometric fraction of the sample budget so small palettes are easy to dial. 0 is two colors (an opposed pair), 1 is one color per sample (a full spectrum). Low values with a high sample count give a clean small palette that reads smooth rather than combed',
    },
    {
      name: 'colorShift',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.colorShift,
      description:
        'Turns the whole palette around the hue wheel. At three colors, 0 gives red/green/blue and 180 gives cyan/magenta/yellow. The colors work subtractively like ink, so these are the fringes you get on a dark subject over a light ground, and their complements on a light subject over a dark one',
    },
    {
      name: 'focusCenter',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.focusCenter,
      description:
        'Radius, as a fraction of the inscribed circle, over which the spread fades in from nothing at the centre. 0 leaves it full to the centre; larger values push a dead zone outward from the middle, the way lateral chromatic aberration is zero at the optical centre',
    },
    {
      name: 'focusEdges',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.focusEdges,
      description:
        'Radius, as a fraction of the inscribed circle, over which the spread fades out to nothing at the edge, like a lens vignette. 0 leaves it full to the edge; larger values pull the fade inward, rounding the effect into a centred disc',
    },
    {
      name: 'lensBulge',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.lensBulge,
      description:
        'Radial lens warp of the image geometry, separate from the color spread. 0 leaves it flat; positive is a barrel/fisheye bulge that magnifies the centre, bows straight lines outward, and lets the corners run off into the background; negative is a pincushion that compresses the centre and stretches the edges inward',
    },
    {
      name: 'lensCircle',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.lensCircle,
      description:
        'Squeezes everything past the inscribed circle into a dense ring just inside it, so the image outline becomes a perfect circle without masking. Pairs with a high lensBulge for a circular fisheye. 0 is off, 1 is full',
    },
    {
      name: 'grainMixer',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainMixer,
      description:
        'Grain woven into the spread: jitters the whole fan per pixel by a percent of its length, so the dispersion breaks into grain that vanishes at the fan centre and grows to the edges. 0 is off',
    },
    {
      name: 'grainOverlay',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainOverlay,
      description:
        'Post-processing black/white film grain over the subject. Screen-stable and masked to the opaque area so the transparent background stays clean. 0 is off',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description:
        'Turbulence added to the spread direction on top of the chosen shape, turning a clean split into a scattered one without changing how far the colors travel',
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
