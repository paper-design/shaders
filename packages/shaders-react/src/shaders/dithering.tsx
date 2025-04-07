import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import {
  getShaderColorFromString,
  ditheringFragmentShader,
  ShaderFitOptions,
  type DitheringUniforms,
  type DitheringParams,
  type ShaderPreset,
  defaultPatternSizing,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface DitheringProps extends ShaderComponentProps, DitheringParams {}

type DitheringPreset = ShaderPreset<DitheringParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: DitheringPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    color1: 'hsla(240, 14%, 17%, 1)',
    color2: 'hsla(34, 26%, 61%, 1)',
    shape: 1,
    type: 3,
    pxSize: 2,
    pxRounded: true,
  },
};

export const warpPreset: DitheringPreset = {
  name: 'Warp',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    color1: 'hsla(195, 47%, 35%, 1)',
    color2: 'hsla(171, 26%, 89%, 1)',
    shape: 2,
    type: 3,
    pxSize: 2,
    pxRounded: true,
  },
} as const;

export const sinePreset: DitheringPreset = {
  name: 'Sine Wave',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    color1: 'hsla(318, 80%, 25%, 1)',
    color2: 'hsla(184, 100%, 40%, 1)',
    shape: 4,
    type: 4,
    pxSize: 11,
    pxRounded: true,
  },
} as const;

export const bugsPreset: DitheringPreset = {
  name: 'Bugs',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(120, 100%, 25%, 1)',
    shape: 3,
    type: 1,
    pxSize: 9,
    pxRounded: true,
  },
} as const;

export const ripplePreset: DitheringPreset = {
  name: 'Ripple',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    color1: 'hsla(20, 50%, 25%, 1)',
    color2: 'hsla(20, 50%, 55%, 1)',
    shape: 5,
    type: 2,
    pxSize: 3,
    pxRounded: false,
  },
} as const;

export const swirlPreset: DitheringPreset = {
  name: 'Swirl',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(200, 26%, 20%, 1)',
    shape: 6,
    type: 4,
    pxSize: 2,
    pxRounded: false,
  },
} as const;

export const spherePreset: DitheringPreset = {
  name: 'Sphere',
  params: {
    ...defaultObjectSizing,
    offsetX: -0.5,
    offsetY: 0.23,
    speed: 1,
    frame: 0,
    color1: 'hsla(320, 26%, 15%, 1)',
    color2: 'hsla(135, 30%, 30%, 1)',
    shape: 7,
    type: 3,
    pxSize: 2.5,
    pxRounded: true,
  },
} as const;

export const ditheringPresets: DitheringPreset[] = [
  defaultPreset,
  spherePreset,
  sinePreset,
  warpPreset,
  ripplePreset,
  bugsPreset,
  swirlPreset
];

export const Dithering: React.FC<DitheringProps> = memo(function DitheringImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  shape = defaultPreset.params.shape,
  type = defaultPreset.params.type,
  pxSize = defaultPreset.params.pxSize,
  pxRounded = defaultPreset.params.pxRounded,

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
}) {
  const uniforms = {
    // Own uniforms
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_shape: shape,
    u_type: type,
    u_pxSize: pxSize,
    u_pxRounded: pxRounded,

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
  } satisfies DitheringUniforms;

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={ditheringFragmentShader} uniforms={uniforms} />
  );
});
