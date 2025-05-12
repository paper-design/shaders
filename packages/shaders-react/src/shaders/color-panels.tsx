import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  getShaderColorFromString,
  colorPanelsFragmentShader,
  ShaderFitOptions,
  type ColorPanelsUniforms,
  type ColorPanelsParams,
  type ShaderPreset,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface ColorPanelsProps extends ShaderComponentProps, ColorPanelsParams {}

type ColorPanelsPreset = ShaderPreset<ColorPanelsParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: ColorPanelsPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colors: ['hsla(259, 100%, 50%, .5)', 'hsla(295, 100%, 50%, .5)', 'hsla(150, 100%, 50%, .5)'],
    colorBack: 'hsla(0, 0%, 15%, 1)',
    count: 7,
    angle: 0.1,
    length: 1,
    blur: 0.5,
    middle: 0.6,
    singleColor: 0.15,
    colorShuffler: 0,
  },
};

export const colorPanelsPresets: ColorPanelsPreset[] = [defaultPreset];

export const ColorPanels: React.FC<ColorPanelsProps> = memo(function ColorPanelsImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  colorBack = defaultPreset.params.colorBack,
  angle = defaultPreset.params.angle,
  length = defaultPreset.params.length,
  blur = defaultPreset.params.blur,
  middle = defaultPreset.params.middle,
  count = defaultPreset.params.count,
  colorShuffler = defaultPreset.params.colorShuffler,
  singleColor = defaultPreset.params.singleColor,

  // Sizing props
  fit = defaultPreset.params.fit,
  scale = defaultPreset.params.scale,
  rotation = defaultPreset.params.rotation,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: ColorPanelsProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_colorBack: getShaderColorFromString(colorBack),
    u_angle: angle,
    u_length: length,
    u_blur: blur,
    u_middle: middle,
    u_count: count,
    u_colorShuffler: colorShuffler,
    u_singleColor: singleColor,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_scale: scale,
    u_rotation: rotation,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies ColorPanelsUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={colorPanelsFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
