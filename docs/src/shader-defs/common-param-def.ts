import type { ParamDef } from './shader-def-types';

type CommonParamDef = Omit<ParamDef, 'defaultValue'>;

export const commonParams: Record<string, CommonParamDef> = {
  speed: {
    name: 'speed',
    type: 'number',
    min: 0,
    max: 2,
    description: 'Animation speed',
  },
  frame: {
    name: 'frame',
    type: 'number',
    min: 0,
    max: 2,
    description: 'Starting animation frame',
  },
  scale: {
    name: 'scale',
    type: 'number',
    min: 0.01,
    max: 4,
    description: 'Overall zoom level of the graphics',
  },
  rotation: {
    name: 'rotation',
    type: 'number',
    min: 0,
    max: 360,
    description: 'Overall rotation angle of the graphics',
  },
  offsetX: {
    name: 'offsetX',
    type: 'number',
    min: -1,
    max: 1,
    description: 'Horizontal offset of the graphics center',
  },
  offsetY: {
    name: 'offsetY',
    type: 'number',
    min: -1,
    max: 1,
    description: 'Vertical offset of the graphics center',
  },
  width: {
    name: 'width',
    type: 'number | string',
    description: 'CSS width style of the shader element',
  },
  height: {
    name: 'height',
    type: 'number | string',
    description: 'CSS height style of the shader element',
  },
  fit: {
    name: 'fit',
    type: 'enum',
    description: 'How to fit the rendered shader into the canvas dimensions',
    options: ['contain', 'cover'],
  },
  worldWidth: {
    name: 'worldWidth',
    type: 'number',
    min: 0,
    max: 2,
    description: "Virtual width of the graphic before it's scaled to fit the canvas",
  },
  worldHeight: {
    name: 'worldHeight',
    type: 'number',
    min: 0,
    max: 2,
    description: "Virtual height of the graphic before it's scaled to fit the canvas",
  },
  originX: {
    name: 'originX',
    type: 'number',
    min: 0,
    max: 2,
    description: 'Reference point for positioning world width in the canvas',
  },
  originY: {
    name: 'originY',
    type: 'number',
    min: 0,
    max: 2,
    description: 'Reference point for positioning world height in the canvas',
  },
  minPixelRatio: {
    name: 'minPixelRatio',
    type: 'number | string',
    description: 'Minimum pixel ratio to use when rendering the shader',
  },
  maxPixelCount: {
    name: 'maxPixelCount',
    type: 'number | string',
    description: 'Maximum pixel count that the shader may process',
  },
};
