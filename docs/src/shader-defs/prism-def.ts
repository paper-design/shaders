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
        'How the colors space out along the shift. 0 spaces them evenly; positive values bunch the middle colors toward the first color, which is how real glass disperses (short wavelengths bend hardest), and negative values bunch them toward the last. The first and last colors sit at the ends of the shift whatever the value, so this has no effect at two colorSteps',
    },
    {
      name: 'shape',
      type: 'enum',
      defaultValue: defaultParams.shape,
      description:
        'The rule for which direction the colors travel. Linear shifts every pixel the same way; radial pushes them out from the centre so the split grows toward the edges; cylinder does that along one axis only; zoom is radial but one-sided, like a zoom blur; bubble windows radial into a round disc that fades before the corners; barrel grows with the square of the radius so the edges bulge like a lens; flare is constant-length radial streaks with the same reach everywhere',
      options: ['linear', 'radial', 'cylinder', 'zoom', 'bubble', 'barrel', 'flare'],
    },
    {
      name: 'angle',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.angle,
      description:
        'Direction of the shift in degrees. Turns the line for linear and cylinder, and does nothing for the symmetric radial',
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
