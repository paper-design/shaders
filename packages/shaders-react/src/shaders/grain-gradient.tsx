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
    colorBack: 'hsla(0, 100%, 2%, 1)',
    color1: 'hsla(52, 89%, 41%, 1)',
    color2: 'hsla(320, 62%, 60%, 1)',
    color3: 'hsla(225, 32%, 24%, 1)',
    blur: 0.35,
    grainDistortion: 0.15,
    sandGrain: 0.5,
    shape: 4,
  },
};

export const grainGradientPresets: GrainGradientPreset[] = [defaultPreset];

export const GrainGradient: React.FC<GrainGradientProps> = memo(function GrainGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  color3 = defaultPreset.params.color3,
  blur = defaultPreset.params.blur,
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
    u_blur: blur,
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
