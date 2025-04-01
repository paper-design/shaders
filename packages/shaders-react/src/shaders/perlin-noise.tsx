import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import {
  defaultPatternSizing,
  getShaderColorFromString,
  perlinNoiseFragmentShader,
  ShaderFitOptions,
  type PerlinNoiseParams,
  type PerlinNoiseUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface PerlinNoiseProps extends ShaderComponentProps, PerlinNoiseParams {}

type PerlinNoisePreset = ShaderPreset<PerlinNoiseParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: PerlinNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(0, 0%, 85%, 1)',
    proportion: 0.35,
    softness: 0.1,
    octaveCount: 2,
    persistence: 1,
    lacunarity: 1.5,
  },
};

export const nintendoWaterPreset: PerlinNoisePreset = {
  name: 'Nintendo Water',
  params: {
    ...defaultPatternSizing,
    scale: 0.2,
    speed: 0.4,
    frame: 0,
    color1: 'hsla(220, 66%, 50%, 1)',
    color2: 'hsla(200, 66%, 90%, 1)',
    proportion: 0.42,
    softness: 0,
    octaveCount: 2,
    persistence: 0.55,
    lacunarity: 1.8,
  },
};

export const colonyPreset: PerlinNoisePreset = {
  name: 'Colony',
  params: {
    ...defaultPatternSizing,
    scale: 0.15,
    speed: 0,
    frame: 0,
    color1: 'hsla(56, 86%, 81%, 1)',
    color2: 'hsla(230, 80%, 20%, 1)',
    octaveCount: 6,
    persistence: 1,
    lacunarity: 2.55,
    proportion: 0.65,
    softness: 0.35,
  },
};

export const phosphenesPreset: PerlinNoisePreset = {
  name: 'Phosphenes',
  params: {
    ...defaultPatternSizing,
    scale: 0.03,
    speed: 0.15,
    frame: 0,
    color1: 'hsla(350, 80%, 70%, 1)',
    color2: 'hsla(150, 50%, 60%, 1)',
    proportion: 0.45,
    softness: 0.45,
    octaveCount: 6,
    persistence: 0.3,
    lacunarity: 3,
  },
};

export const mossPreset: PerlinNoisePreset = {
  name: 'Moss',
  params: {
    ...defaultPatternSizing,
    scale: 0.15,
    speed: 0.02,
    frame: 0,
    color1: 'hsla(137, 100%, 51%, 1)',
    color2: 'hsla(0, 0%, 15%, 1)',
    proportion: 0.65,
    softness: 0.35,
    octaveCount: 6,
    persistence: 1,
    lacunarity: 2.55,
  },
};

export const wormsPreset: PerlinNoisePreset = {
  name: 'Worms',
  params: {
    ...defaultPatternSizing,
    scale: 2,
    speed: 0,
    frame: 0,
    color1: 'hsla(0, 100%, 100%, 1)',
    color2: 'hsla(0, 0%, 35%, 1)',
    proportion: 0.5,
    softness: 0,
    octaveCount: 1,
    persistence: 1,
    lacunarity: 1.5,
  },
};

export const perlinNoisePresets: PerlinNoisePreset[] = [
  defaultPreset,
  nintendoWaterPreset,
  colonyPreset,
  phosphenesPreset,
  mossPreset,
  wormsPreset,
];

export const PerlinNoise: React.FC<PerlinNoiseProps> = memo(function PerlinNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  color1 = defaultPreset.params.color1,
  color2 = defaultPreset.params.color2,
  proportion = defaultPreset.params.proportion,
  softness = defaultPreset.params.softness,
  octaveCount = defaultPreset.params.octaveCount,
  persistence = defaultPreset.params.persistence,
  lacunarity,

  // Sizing props
  fit = defaultPreset.params.fit,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  scale = defaultPreset.params.scale,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  ...props
}) {
  const uniforms = {
    // Own uniforms
    u_color1: getShaderColorFromString(color1),
    u_color2: getShaderColorFromString(color2),
    u_proportion: proportion,
    u_softness: softness ?? defaultPreset.params.softness,
    u_octaveCount: octaveCount ?? defaultPreset.params.octaveCount,
    u_persistence: persistence ?? defaultPreset.params.persistence,
    u_lacunarity: lacunarity ?? defaultPreset.params.lacunarity,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_scale: scale,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies PerlinNoiseUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={perlinNoiseFragmentShader}
      uniforms={uniforms}
    />
  );
});
