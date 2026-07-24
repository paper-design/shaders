import { lensDistortionPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { staticImageCommonParams } from './common-param-def';

const defaultParams = lensDistortionPresets[0].params;

export const lensDistortionDef: ShaderDef = {
  name: 'Lens Distortion',
  description:
    'Lens Distortion image filter separates an image into shifting color layers (recreating the chromatic aberration of a lens) and warps the image geometry itself, curving it outward or inward the circle (like barrel and pincushion distortion).',
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
        'Bias of the color spread: warps how the colors distribute along it. 0 spaces them evenly; toward +/-1 they bunch toward one end of the fan and spread out at the other (no effect with spread = 0)',
    },
    {
      name: 'angle',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.angle,
      description: 'Angle of the color spread in degrees (no effect with spread = 0 or perspective = 1)',
    },
    {
      name: 'perspective',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.perspective,
      description:
        'Perspective of the spread: shapes its direction from a straight line to a radial burst. At 0 all layers spread along the straight line set by angle; at 1 they radiate outward from the centre (no effect with spread = 0)',
    },
    {
      name: 'count',
      type: 'number',
      min: 2,
      max: 50,
      step: 1,
      defaultValue: defaultParams.count,
      description:
        'Number of colored layers making the spread - more layers blend into a blur, fewer stay as separate ghosted copies (no effect with spread = 0)',
    },
    {
      name: 'colorRange',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.colorRange,
      description:
        'Number of color groups in the gradient formed by the layers. 0 is two colors (an opposed pair), 1 is a full spectrum with one color per layer (no effect with spread = 0 or count = 2)',
    },
    {
      name: 'colorShift',
      type: 'number',
      min: 0,
      max: 360,
      defaultValue: defaultParams.colorShift,
      description: 'Rotates the colorRange colors around the hue wheel (no effect with spread = 0)',
    },
    {
      name: 'focusCenter',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.focusCenter,
      description:
        'Reduces the spread distance in a circular zone at the centre of the image. 0 keeps the full layers spread in the middle, higher values move the layers closer building an illusion of focus (no effect with spread = 0)',
    },
    {
      name: 'focusEdges',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.focusEdges,
      description:
        'Reduces the spread distance along the image edges. 0 keeps the full layers spread at the edges, 1 restores the original image at the edges regardless of the chosen spread distance (no effect with spread = 0)',
    },
    {
      name: 'noise',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noise,
      description: 'Noise distortion over the spread direction within the spread distance (no effect with spread = 0)',
    },
    {
      name: 'noiseFrequency',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.noiseFrequency,
      description: 'Noise frequency (scale), higher value gives more detailed distortion (no effect with spread = 0 or noise = 0)',
    },
    {
      name: 'noiseOffset',
      type: 'number',
      min: 0,
      max: 30,
      defaultValue: defaultParams.noiseOffset,
      description:
        'Shifts the noise texture, can be used as a seed or as an offset relative to the canvas (no effect with spread = 0 or noise = 0)',
    },
    {
      name: 'lensBulge',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.lensBulge,
      description:
        'One of 2 props independent of the color spread: lens warp of the image geometry. 0 is flat, positive bulges out like a fisheye, negative pinches in like a pincushion',
    },
    {
      name: 'lensCircle',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.lensCircle,
      description:
        'One of 2 props independent of the color spread: squeezes pixels outside the circle inward. 0 is off, 1 gives the image exact circular shape with any lensBulge value',
    },
    {
      name: 'grainMixer',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainMixer,
      description: 'Strength of grain distortion applied to the edges of the colored layers (no effect with spread = 0)',
    },
    {
      name: 'grainOverlay',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.grainOverlay,
      description: 'Post-processing b/w grain overlay',
    },
    ...staticImageCommonParams,
  ],
};
