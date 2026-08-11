import { lensDistortionPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticImageCommonParams } from './common-param-def';

const defaultParams = lensDistortionPresets[0].params;

export const lensDistortionDef: ShaderDef = {
  name: 'Lens Distortion',
  description:
    'Lens Distortion image filter separates an image into shifting color layers (recreating the chromatic aberration of a lens) and warps the image geometry itself, curving it outward or inward like barrel and pincushion distortion.',
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
      description:
        'Strength of the color split - how far the color layers are pushed apart. This is the master dial for the chromatic aberration; at 0 there is no split and all the other color controls do nothing',
    },
    {
      name: 'bias',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.bias,
      description:
        'Bias of the color spread: warps how the colors distribute along it. 0 spaces them evenly; toward +/-1 they bunch toward one end of the fan and spread out at the other (needs spread > 0)',
    },
    {
      name: 'angle',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.angle,
      description: 'Angle of the color spread in degrees (needs spread > 0, perspective < 1)',
    },
    {
      name: 'perspective',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.perspective,
      description:
        'Perspective of the spread: shapes its direction from a straight line to a radial burst. At 0 all layers spread along the straight line set by angle; at 1 they radiate outward from the centre (needs spread > 0)',
    },
    {
      name: 'count',
      type: 'number',
      min: 2,
      max: 50,
      step: 1,
      defaultValue: defaultParams.count,
      description:
        'Number of colored layers making the spread - more layers blend into a blur, fewer stay as separate ghosted copies (needs spread > 0)',
    },
    {
      name: 'dispersion',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.dispersion,
      description:
        'Overall amount of color dispersion: at 1 each layer takes its own color from the spectrum, giving the chromatic aberration look; at 0 every layer keeps the original image color, so the spread reads as a plain blur (needs spread > 0)',
    },
    {
      name: 'dispersionShift',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.dispersionShift,
      description:
        'Balances the dispersion between a soft circular zone at the centre of the image and the rest of it: 0 applies it evenly over the whole image, -1 keeps it in the centre only, 1 keeps it at the edges only (needs spread > 0, dispersion > 0)',
    },
    {
      name: 'dispersionColor',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.dispersionColor,
      description:
        'Rotates the colors around the hue wheel, 0 to 1 for a full turn (needs spread > 0, dispersion > 0)',
    },
    {
      name: 'focusCenter',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.focusCenter,
      description:
        'Reduces the spread distance in a circular zone at the centre of the image. 0 keeps the full layers spread in the middle, higher values move the layers closer building an illusion of focus (needs spread > 0)',
    },
    {
      name: 'focusEdges',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.focusEdges,
      description:
        'Reduces the spread distance along the image edges. 0 keeps the full layers spread at the edges, 1 restores the original image at the edges regardless of the chosen spread distance (needs spread > 0)',
    },
    {
      name: 'swirl',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.swirl,
      description:
        'Bends the spread around the centre of the image, so the layers trail along circles like a vortex. Each layer is rotated around the centre by an angle growing along the spread, and the effect fades out beyond the inscribed circle (needs spread > 0)',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description: 'Noise distortion over the spread direction within the spread distance (needs spread > 0)',
    },
    {
      name: 'noiseFrequency',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noiseFrequency,
      description:
        'Noise frequency (scale), higher value gives more detailed distortion (needs spread > 0, noise > 0)',
    },
    {
      name: 'noiseOffset',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noiseOffset,
      description:
        'Shifts the noise pattern diagonally, can be used as a seed to get a different scatter (needs spread > 0, noise > 0)',
    },
    {
      name: 'lensBulge',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.lensBulge,
      description:
        'Lens warp of the image geometry, applied before the color spread. 0 is flat, positive bulges out like a fisheye, negative pinches in like a pincushion. Strong positive values fade out the corners of the image',
    },
    {
      name: 'lensCircle',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.lensCircle,
      description:
        'Squeezes pixels outside the circle inward. 0 is off, 1 gives the image exact circular shape with any lensBulge value. Near the rim it also turns the spread radial and damps it, keeping the circular edge clean',
    },
    {
      name: 'grainMixer',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainMixer,
      description:
        'Scatters the spread with grain noise, breaking up the edges of the colored layers (needs spread > 0)',
    },
    {
      name: 'grainOverlay',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainOverlay,
      description: 'Post-processing b/w grain overlay',
    },
    {
      name: 'imageX',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.imageX,
      description: 'Pans the image horizontally behind the effect, without moving the effect itself. 0 is centred',
    },
    {
      name: 'imageY',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.imageY,
      description: 'Pans the image vertically behind the effect, without moving the effect itself. 0 is centred',
    },
    ...staticImageCommonParams,
  ],
};
