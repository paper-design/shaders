import { colorPanelsPresets } from '@paper-design/shaders-react';
import type { ShaderDef } from './shader-def-types';
import { animatedCommonParams } from './common-param-def';

const defaultParams = colorPanelsPresets[0].params;

export const colorPanelsDef: ShaderDef = {
  name: 'Color Panels',
  description: 'Glowing translucent 3D panels rotating around a central axis.',
  params: [
    {
      name: 'colors',
      type: 'string[]',
      defaultValue: [],
      isColor: true,
      description: 'Up to 7 colors used to color the panels',
    },
    {
      name: 'colorBack',
      type: 'string',
      defaultValue: defaultParams.colorBack,
      isColor: true,
      description: 'Background color',
    },
    {
      name: 'density',
      type: 'number',
      min: 0.25,
      max: 7,
      defaultValue: defaultParams.density,
      description: 'Angle between every 2 panels',
    },
    {
      name: 'angle1',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.angle1,
      description: 'Skew angle applied to all panes',
    },
    {
      name: 'angle2',
      type: 'number',
      min: -1,
      max: 1,
      defaultValue: defaultParams.angle2,
      description: 'Skew angle applied to all panes',
    },
    {
      name: 'length',
      type: 'number',
      min: 0,
      max: 3,
      defaultValue: defaultParams.length,
      description: 'Panel length (relative to total height)',
    },
    {
      name: 'edges',
      type: 'boolean',
      defaultValue: defaultParams.edges,
      description: 'Color highlight on the panels edges',
      options: ['true', 'false'],
    },
    {
      name: 'blur',
      type: 'number',
      min: 0,
      max: 0.5,
      defaultValue: defaultParams.blur,
      description: 'Side blur (0 for sharp edges)',
    },
    {
      name: 'fadeIn',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.fadeIn,
      description: 'Transparency near central axis',
    },
    {
      name: 'fadeOut',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.fadeOut,
      description: 'Transparency near viewer',
    },
    {
      name: 'gradient',
      type: 'number',
      min: 0,
      max: 1,
      defaultValue: defaultParams.gradient,
      description: 'Color mixing within a panel (0 = solid panel color, 1 = gradient of two colors)',
    },
    ...animatedCommonParams,
  ],
};
