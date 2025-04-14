import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import { colorPropsAreEqual } from '../color-props-are-equal';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  meshGradientFragmentShader,
  ShaderFitOptions,
  type MeshGradientParams,
  type MeshGradientUniforms,
  type ShaderPreset,
} from '@paper-design/shaders';

export interface MeshGradientProps extends ShaderComponentProps, MeshGradientParams {}

type MeshGradientPreset = ShaderPreset<MeshGradientParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: MeshGradientPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    speed: 1,
    frame: 40000,
    colors: ['hsla(259, 100%, 50%, 1)', 'hsla(150, 100%, 50%, 1)', 'hsla(48, 100%, 50%, 1)', 'hsla(295, 100%, 50%, 1)'],
    waveDistortion: 0.8,
    swirlDistortion: 0.1,
  },
};

export const purplePreset: MeshGradientPreset = {
  name: 'Purple',
  params: {
    ...defaultObjectSizing,
    speed: 0.6,
    frame: 100,
    colors: ['hsla(259, 29%, 73%, 1)', 'hsla(263, 57%, 39%, 1)', 'hsla(48, 73%, 84%, 1)', 'hsla(295, 32%, 70%, 1)'],
    waveDistortion: 0.3,
    swirlDistortion: 0.5,
  },
};

export const beachPreset: MeshGradientPreset = {
  name: 'Beach',
  params: {
    ...defaultObjectSizing,
    speed: 0.1,
    frame: 0,
    colors: ['hsla(186, 81%, 83%, 1)', 'hsla(198, 55%, 68%, 1)', 'hsla(53, 67%, 88%, 1)', 'hsla(45, 93%, 73%, 1)'],
    waveDistortion: 0.8,
    swirlDistortion: 0.35,
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset, purplePreset, beachPreset];

export const MeshGradient: React.FC<MeshGradientProps> = memo(function MeshGradientImpl({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colors = defaultPreset.params.colors,
  waveDistortion = defaultPreset.params.waveDistortion,
  swirlDistortion = defaultPreset.params.swirlDistortion,

  // Sizing props
  fit = defaultPreset.params.fit,
  rotation = defaultPreset.params.rotation,
  scale = defaultPreset.params.scale,
  originX = defaultPreset.params.originX,
  originY = defaultPreset.params.originY,
  offsetX = defaultPreset.params.offsetX,
  offsetY = defaultPreset.params.offsetY,
  worldWidth = defaultPreset.params.worldWidth,
  worldHeight = defaultPreset.params.worldHeight,
  ...props
}: MeshGradientProps) {
  const uniforms = {
    // Own uniforms
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_waveDistortion: waveDistortion,
    u_swirlDistortion: swirlDistortion,

    // Sizing uniforms
    u_fit: ShaderFitOptions[fit],
    u_rotation: rotation,
    u_scale: scale,
    u_offsetX: offsetX,
    u_offsetY: offsetY,
    u_originX: originX,
    u_originY: originY,
    u_worldWidth: worldWidth,
    u_worldHeight: worldHeight,
  } satisfies MeshGradientUniforms;

  return (
    <ShaderMount
      {...props}
      speed={speed}
      frame={frame}
      fragmentShader={meshGradientFragmentShader}
      uniforms={uniforms}
    />
  );
}, colorPropsAreEqual);
