import { useMemo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '../shader-mount';
import {
  defaultObjectSizing,
  getShaderColorFromString,
  smokeRingFragmentShader,
  ShaderFitOptions,
  type ShaderPreset,
  type SmokeRingParams,
  type SmokeRingUniforms,
} from '@paper-design/shaders';

export interface SmokeRingProps extends ShaderComponentProps, SmokeRingParams {}

type SmokeRingPreset = ShaderPreset<SmokeRingParams>;

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: SmokeRingPreset = {
  name: 'Default',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 0.5,
    frame: 0,
    colorBack: 'hsla(0, 0%, 0%, 1)',
    colorInner: 'hsla(0, 0%, 100%, 1)',
    colorOuter: 'hsla(223, 15%, 36%, 1)',
    noiseScale: 1,
    thickness: 0.5,
  },
};

export const cloudPreset: SmokeRingPreset = {
  name: 'Cloud',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 1,
    frame: 0,
    colorBack: 'hsla(215, 74%, 72%, 1)',
    colorInner: 'hsla(0, 0%, 100%, 1)',
    colorOuter: 'hsla(0, 0%, 100%, 0.5)',
    noiseScale: 1.8,
    thickness: 1,
  },
};

export const firePreset: SmokeRingPreset = {
  name: 'Fire',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 4,
    frame: 0,
    colorBack: 'hsla(20, 100%, 5%, 1)',
    colorInner: 'hsla(40, 100%, 50%, 1)',
    colorOuter: 'hsla(0, 100%, 50%, 1)',
    noiseScale: 1.4,
    thickness: 0.35,
  },
};

export const electricPreset: SmokeRingPreset = {
  name: 'Electric',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: -2.5,
    frame: 0,
    colorBack: 'hsla(47, 50%, 7%, 1)',
    colorInner: 'hsla(47, 100%, 64%, 1)',
    colorOuter: 'hsla(47, 100%, 64%, 1)',
    noiseScale: 1.8,
    thickness: 0.1,
  },
};

export const poisonPreset: SmokeRingPreset = {
  name: 'Poison',
  params: {
    ...defaultObjectSizing,
    scale: 1,
    speed: 3,
    frame: 0,
    colorBack: 'hsla(120, 100%, 3%, 1)',
    colorInner: 'hsla(120, 100%, 3%, 1)',
    colorOuter: 'hsla(120, 100%, 66%, 1)',
    noiseScale: 5,
    thickness: 0.6,
  },
};

export const smokeRingPresets: SmokeRingPreset[] = [
  defaultPreset,
  cloudPreset,
  firePreset,
  electricPreset,
  poisonPreset,
];

export const SmokeRing = ({
  // Own props
  speed = defaultPreset.params.speed,
  frame = defaultPreset.params.frame,
  colorBack = defaultPreset.params.colorBack,
  colorInner = defaultPreset.params.colorInner,
  colorOuter = defaultPreset.params.colorOuter,
  noiseScale = defaultPreset.params.noiseScale,
  thickness = defaultPreset.params.thickness,

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
}: SmokeRingProps): React.ReactElement => {
  const uniforms = useMemo(() => {
    return {
      // Own uniforms
      u_colorBack: getShaderColorFromString(colorBack),
      u_colorInner: getShaderColorFromString(colorInner),
      u_colorOuter: getShaderColorFromString(colorOuter),
      u_noiseScale: noiseScale,
      u_thickness: thickness,

      // Sizing uniforms
      u_fit: ShaderFitOptions[fit],
      u_scale: scale,
      u_offsetX: offsetX,
      u_offsetY: offsetY,
      u_originX: originX,
      u_originY: originY,
      u_worldWidth: worldWidth,
      u_worldHeight: worldHeight,
    } satisfies SmokeRingUniforms;
  }, [
    // Own props
    colorBack,
    colorInner,
    colorOuter,
    noiseScale,
    thickness,

    // Sizing props
    fit,
    scale,
    offsetX,
    offsetY,
    originX,
    originY,
    worldWidth,
    worldHeight,
  ]);

  return (
    <ShaderMount {...props} speed={speed} frame={frame} fragmentShader={smokeRingFragmentShader} uniforms={uniforms} />
  );
};
