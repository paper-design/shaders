import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import {
  getShaderColorFromString,
  grainGradientFragmentShader,
  ShaderFitOptions,
  type GrainGradientUniforms,
  type GrainGradientParams,
  type ShaderPreset,
  defaultPatternSizing,
  defaultObjectSizing,
} from '@paper-design/shaders';

export interface GrainGradientProps extends ShaderComponentProps, GrainGradientParams {}

type GrainGradientPreset = ShaderPreset<GrainGradientParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: GrainGradientPreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(210, 100%, 3%, 1)',
    color1: 'hsla(32, 89%, 40%, 1)',
    color2: 'hsla(46, 60%, 60%, 1)',
    color3: 'hsla(39, 28%, 81%, 1)',
    softness: 0.35,
    grainDistortion: 0.15,
    sandGrain: 0.5,
    shape: 1,
  },
};

export const dotsPreset: GrainGradientPreset = {
  name: 'Dots',
  params: {
    ...defaultPatternSizing,
    scale: 0.6,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(0, 100%, 2%, 1)',
    color1: 'hsla(0, 100%, 22%, 1)',
    color2: 'hsla(210, 85%, 69%, 1)',
    color3: 'hsla(48, 52%, 90%, 1)',
    softness: 0.5,
    grainDistortion: 0.15,
    sandGrain: 0.5,
    shape: 2,
  },
};

export const truchetPreset: GrainGradientPreset = {
  name: 'Truchet',
  params: {
    ...defaultPatternSizing,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(0, 100%, 2%, 1)',
    color1: 'hsla(24, 100%, 22%, 1)',
    color2: 'hsla(35, 85%, 69%, 1)',
    color3: 'hsla(100, 52%, 45%, 1)',
    softness: 0,
    grainDistortion: 0.15,
    sandGrain: 0.5,
    shape: 3,
  },
};

export const cornersPreset: GrainGradientPreset = {
  name: 'Corners',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(210, 80%, 6%, 1)',
    color1: 'hsla(200, 100%, 40%, 1)',
    color2: 'hsla(170, 100%, 50%, 1)',
    color3: 'hsla(50, 100%, 50%, 1)',
    softness: 0.2,
    grainDistortion: 0.35,
    sandGrain: 0.35,
    shape: 4,
  },
};

export const ripplePreset: GrainGradientPreset = {
  name: 'Ripple',
  params: {
    ...defaultObjectSizing,
    scale: 0.5,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(30, 100%, 4%, 1)',
    color1: 'hsla(25, 100%, 22%, 1)',
    color2: 'hsla(140, 70%, 70%, 1)',
    color3: 'hsla(4305, 64%, 11%, 1)',
    softness: 1,
    grainDistortion: 1,
    sandGrain: 0.5,
    shape: 5,
  },
};

export const blobPreset: GrainGradientPreset = {
  name: 'Blob',
  params: {
    ...defaultObjectSizing,
    scale: 1.3,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(240, 30%, 8%, 1)',
    color1: 'hsla(200, 30%, 35%, 1)',
    color2: 'hsla(50, 30%, 55%, 1)',
    color3: 'hsla(90, 25%, 45%, 1)',
    softness: 0,
    grainDistortion: 0.15,
    sandGrain: 0.5,
    shape: 6,
  },
};

export const spherePreset: GrainGradientPreset = {
  name: 'Sphere',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(230, 100%, 5%, 1)',
    color1: 'hsla(210, 100%, 35%, 1)',
    color2: 'hsla(180, 95%, 60%, 1)',
    color3: 'hsla(130, 80%, 45%, 1)',
    softness: 1,
    grainDistortion: 0.15,
    sandGrain: 0.5,
    shape: 7,
  },
};

export const grainGradientPresets: GrainGradientPreset[] = [
  defaultPreset,
  dotsPreset,
  truchetPreset,
  cornersPreset,
  ripplePreset,
  blobPreset,
  spherePreset,
];

export const GrainGradient: React.FC<GrainGradientProps> = memo(function GrainGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  color3 = defaultPreset.params.color3,
  softness = defaultPreset.params.softness,
  grainDistortion = defaultPreset.params.grainDistortion,
  sandGrain = defaultPreset.params.sandGrain,
  shape = defaultPreset.params.shape,

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
    u_colorBack: getShaderColorFromString(colorBack),
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_color3: getShaderColorFromString(color3),
    u_softness: softness,
    u_grainDistortion: grainDistortion,
    u_sandGrain: sandGrain,
    u_shape: shape,

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
  } satisfies GrainGradientUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={grainGradientFragmentShader}
      uniforms={uniforms}
    />
  );
});
