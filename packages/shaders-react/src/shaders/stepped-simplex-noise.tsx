import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import {
  getShaderColorFromString,
  steppedSimplexNoiseFragmentShader,
  ShaderFitOptions,
  type SteppedSimplexNoiseUniforms,
  type SteppedSimplexNoiseParams,
  type ShaderPreset,
  defaultPatternSizing,
} from '@paper-design/shaders';

export interface SteppedSimplexNoiseProps extends ShaderComponentProps, SteppedSimplexNoiseParams {}

type SteppedSimplexNoisePreset = ShaderPreset<SteppedSimplexNoiseParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: SteppedSimplexNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 0.15,
    frame: 0,
    color1: 'hsla(208, 25%, 45%, 1)',
    color2: 'hsla(94, 38%, 59%, 1)',
    color3: 'hsla(359, 94%, 62%, 1)',
    color4: 'hsla(42, 93%, 64%, 1)',
    color5: 'hsla(0, 0%, 100%, 1)',
    stepsNumber: 13,
  },
};

const magmaPreset: SteppedSimplexNoisePreset = {
  name: 'Magma',
  params: {
    ...defaultPatternSizing,
    scale: 0.3,
    speed: 0.2,
    frame: 0,
    color1: 'hsla(0, 100%, 36%, 1)',
    color2: 'hsla(0, 95%, 44%, 1)',
    color3: 'hsla(20, 100%, 49%, 1)',
    color4: 'hsla(45, 100%, 45%, 1)',
    color5: 'hsla(31, 100%, 94%, 1)',
    stepsNumber: 8,
  },
};

const bloodCellPreset: SteppedSimplexNoisePreset = {
  name: 'Blood cell',
  params: {
    ...defaultPatternSizing,
    scale: 1.2,
    speed: 0.22,
    frame: 0,
    color1: 'hsla(302, 43%, 13%, 1)',
    color2: 'hsla(325, 93%, 17%, 1)',
    color3: 'hsla(338, 80%, 25%, 1)',
    color4: 'hsla(338, 80%, 25%, 1)',
    color5: 'hsla(2, 85%, 72%, 1)',
    stepsNumber: 29,
  },
};

const firstContactPreset: SteppedSimplexNoisePreset = {
  name: 'First contact',
  params: {
    ...defaultPatternSizing,
    scale: 1.2,
    speed: -0.1,
    frame: 0,
    color1: 'hsla(300, 43%, 82%, 1)',
    color2: 'hsla(266, 70%, 9%, 1)',
    color3: 'hsla(289, 36%, 26%, 1)',
    color4: 'hsla(0, 41%, 78%, 1)',
    color5: 'hsla(0, 100%, 96%, 1)',
    stepsNumber: 40,
  },
};

export const steppedSimplexNoisePresets: SteppedSimplexNoisePreset[] = [
  defaultPreset,
  magmaPreset,
  bloodCellPreset,
  firstContactPreset,
];

export const SteppedSimplexNoise: React.FC<SteppedSimplexNoiseProps> = memo(function SteppedSimplexNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  color3 = defaultPreset.params.color3,
  color4 = defaultPreset.params.color4,
  color5 = defaultPreset.params.color5,
  stepsNumber = defaultPreset.params.stepsNumber,

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
    u_color3: getShaderColorFromString(color3),
    u_color4: getShaderColorFromString(color4),
    u_color5: getShaderColorFromString(color5),
    u_steps_number: stepsNumber,

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
  } satisfies SteppedSimplexNoiseUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={steppedSimplexNoiseFragmentShader}
      uniforms={uniforms}
    />
  );
});
