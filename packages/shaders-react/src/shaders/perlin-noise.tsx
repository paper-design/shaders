import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount.js';
import { colorPropsAreEqual } from '../color-props-are-equal.js';
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

export const defaultPreset: PerlinNoisePreset = {
  name: 'Default',
  params: {
    ...defaultPatternSizing,
    speed: 0.5,
    frame: 0,
    colorBack: '#632ad5',
    colorFront: '#fccff7',
    proportion: 0.35,
    softness: 0.1,
    octaveCount: 1,
    persistence: 1,
    lacunarity: 1.5,
  },
};

export const nintendoWaterPreset: PerlinNoisePreset = {
  name: 'Nintendo Water',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.2,
    speed: 0.4,
    frame: 0,
    colorBack: '#2d69d4',
    colorFront: '#d1eefc',
    proportion: 0.42,
    softness: 0,
    octaveCount: 2,
    persistence: 0.55,
    lacunarity: 1.8,
  },
};

export const mossPreset: PerlinNoisePreset = {
  name: 'Moss',
  params: {
    ...defaultPatternSizing,
    scale: 1 / 0.15,
    speed: 0.02,
    frame: 0,
    colorBack: '#05ff4a',
    colorFront: '#262626',
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
    scale: 0.9,
    speed: 0,
    frame: 0,
    colorBack: '#ffffff00',
    colorFront: '#595959',
    proportion: 0.5,
    softness: 0,
    octaveCount: 1,
    persistence: 1,
    lacunarity: 1.5,
  },
};

export const perlinNoisePresets: PerlinNoisePreset[] = [defaultPreset, nintendoWaterPreset, mossPreset, wormsPreset];

export const PerlinNoise: React.FC<PerlinNoiseProps> = memo(function PerlinNoiseImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorFront = defaultPreset.params.colorFront,
  colorBack = defaultPreset.params.colorBack,
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
  rotation = defaultPreset.params.rotation,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  ...props
}: PerlinNoiseProps) {
  const uniforms = {
    // Own uniforms
    u_colorBack: getShaderColorFromString(colorBack),
    u_colorFront: getShaderColorFromString(colorFront),
    u_proportion: proportion,
    u_softness: softness ?? defaultPreset.params.softness,
    u_octaveCount: octaveCount ?? defaultPreset.params.octaveCount,
    u_persistence: persistence ?? defaultPreset.params.persistence,
    u_lacunarity: lacunarity ?? defaultPreset.params.lacunarity,

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
}, colorPropsAreEqual);
