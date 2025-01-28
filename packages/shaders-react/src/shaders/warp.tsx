import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  warpFragmentShader,
  type WarpUniforms,
  type PatternShape,
  PatternShapes,
} from '@paper-design/shaders';

export type WarpParams = {
  scale?: number;
  rotation?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  proportion?: number;
  softness?: number;
  distortion?: number;
  swirl?: number;
  swirlIterations?: number;
  shapeScale?: number;
  shape?: PatternShape;
} & GlobalParams;

export type WarpProps = Omit<ShaderMountProps, 'fragmentShader'> & WarpParams;

type WarpPreset = { name: string; params: Required<WarpParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: WarpPreset = {
  name: 'Default',
  params: {
    scale: 1,
    rotation: 0,
    speed: 0.1,
    seed: 0,
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(203, 80%, 70%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    proportion: 0.35,
    softness: 1,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.1,
    shape: PatternShapes.Checks,
  },
};

export const presetCauldron: WarpPreset = {
  name: 'Cauldron Pot',
  params: {
    scale: 1.1,
    rotation: 1.62,
    speed: 1,
    seed: 0,
    color1: 'hsla(100, 51%, 75%, 1)',
    color2: 'hsla(220, 39%, 32%, 1)',
    color3: 'hsla(129.2, 41.9%, 6.1%, 1)',
    proportion: 0.64,
    softness: 0.95,
    distortion: 0.2,
    swirl: 0.86,
    swirlIterations: 7,
    shapeScale: 0,
    shape: PatternShapes.Edge,
  },
};

export const presetSilk: WarpPreset = {
  name: 'Silk',
  params: {
    scale: 0.26,
    rotation: 0,
    speed: 0.5,
    seed: 0,
    color1: 'hsla(0, 9%, 7%, 1)',
    color2: 'hsla(8, 13%, 34%, 1)',
    color3: 'hsla(5, 8%, 71%, 1)',
    proportion: 0,
    softness: 1,
    distortion: 0.3,
    swirl: 0.6,
    swirlIterations: 11,
    shapeScale: 0.05,
    shape: PatternShapes.Stripes,
  },
};

export const presetPassion: WarpPreset = {
  name: 'Passion',
  params: {
    scale: 0.25,
    rotation: 1.35,
    speed: 0.3,
    seed: 0,
    color1: 'hsla(0, 44.7%, 14.9%, 1)',
    color2: 'hsla(353.4, 34%, 42.2%, 1)',
    color3: 'hsla(29, 100%, 76.1%, 1)',
    proportion: 0.5,
    softness: 1,
    distortion: 0.09,
    swirl: 0.9,
    swirlIterations: 6,
    shapeScale: 0.25,
    shape: PatternShapes.Checks,
  },
};

export const presetPhantom: WarpPreset = {
  name: 'Phantom',
  params: {
    scale: 0.68,
    rotation: 1.8,
    speed: 1.25,
    seed: 0,
    color1: 'hsla(242.2, 44.3%, 12%, 1)',
    color2: 'hsla(236.1, 80.4%, 70%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    proportion: 0.45,
    softness: 1,
    distortion: 0.16,
    swirl: 0.3,
    swirlIterations: 7,
    shapeScale: 0.1,
    shape: PatternShapes.Checks,
  },
};

export const presetAbyss: WarpPreset = {
  name: 'The Abyss',
  params: {
    scale: 0.1,
    rotation: 2,
    speed: 0.06,
    seed: 0,
    color1: 'hsla(242.2, 44.3%, 12%, 1)',
    color2: 'hsla(236.1, 80.4%, 70%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    proportion: 0,
    softness: 1,
    distortion: 0.09,
    swirl: 0.48,
    swirlIterations: 4,
    shapeScale: 0.1,
    shape: PatternShapes.Edge,
  },
};

export const presetInk: WarpPreset = {
  name: 'Live Ink',
  params: {
    scale: 2,
    rotation: 1.5,
    speed: 0.25,
    seed: 0,
    color1: 'hsla(210, 11.1%, 7.1%, 1)',
    color2: 'hsla(165, 9%, 65.1%, 1)',
    color3: 'hsla(84, 100%, 97.1%, 1)',
    proportion: 0.35,
    softness: 0.3,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shapeScale: 0.26,
    shape: PatternShapes.Checks,
  },
};

export const presetIceberg: WarpPreset = {
  name: 'Iceberg',
  params: {
    scale: 1.1,
    rotation: 2,
    speed: 0.05,
    seed: 0,
    color1: 'hsla(0, 0%, 100%, 1)',
    color2: 'hsla(220, 38.7%, 32%, 1)',
    color3: 'hsla(129.2, 41.9%, 6.1%, 1)',
    proportion: 0.3,
    softness: 1,
    distortion: 0.2,
    swirl: 0.86,
    swirlIterations: 7,
    shapeScale: 0,
    shape: PatternShapes.Checks,
  },
};

export const presetNectar: WarpPreset = {
  name: 'Nectar',
  params: {
    scale: 0.24,
    rotation: 0,
    speed: 0.42,
    seed: 0,
    color1: 'hsla(37.5, 22.2%, 7.1%, 1)',
    color2: 'hsla(38.5, 59.1%, 63.1%, 1)',
    color3: 'hsla(37.6, 30%, 95.2%, 1)',
    proportion: 0.24,
    softness: 1,
    distortion: 0.21,
    swirl: 0.57,
    swirlIterations: 10,
    shapeScale: 0.32,
    shape: PatternShapes.Edge,
  },
};

export const presetFilteredLight: WarpPreset = {
  name: 'Filtered Light',
  params: {
    scale: 2,
    rotation: 0.44,
    speed: 0.32,
    seed: 0,
    color1: 'hsla(60.2, 7.8%, 8.3%, 1)',
    color2: 'hsla(64.4, 27.8%, 81%, 1)',
    color3: 'hsla(60, 100%, 93.9%, 1)',
    proportion: 0.25,
    softness: 1,
    distortion: 0.06,
    swirl: 0,
    swirlIterations: 0,
    shapeScale: 0,
    shape: PatternShapes.Stripes
  },
};

export const presetKelp: WarpPreset = {
  name: 'Kelp',
  params: {
    scale: 0.38,
    rotation: 0.6,
    speed: 2,
    seed: 0,
    color1: 'hsla(79.3, 100%, 78%, 1)',
    color2: 'hsla(112, 10.5%, 28%, 1)',
    color3: 'hsla(203.3, 50%, 7.1%, 1)',
    proportion: 1,
    softness: 0,
    distortion: 0,
    swirl: 0.15,
    swirlIterations: 0,
    shapeScale: 0.74,
    shape: PatternShapes.Stripes
  },
};



export const warpPresets: WarpPreset[] = [
  defaultPreset,
  presetAbyss,
  presetCauldron,
  presetFilteredLight,
  presetIceberg,
  presetInk,
  presetKelp,
  presetNectar,
  presetPassion,
  presetPhantom,
  presetSilk,
];

export const Warp = (props: WarpProps): JSX.Element => {
  const uniforms: WarpUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_rotation: props.rotation ?? defaultPreset.params.rotation,
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color2),
      u_proportion: props.proportion ?? defaultPreset.params.proportion,
      u_softness: props.softness ?? defaultPreset.params.softness,
      u_distortion: props.distortion ?? defaultPreset.params.distortion,
      u_swirl: props.swirl ?? defaultPreset.params.swirl,
      u_swirlIterations: props.swirlIterations ?? defaultPreset.params.swirlIterations,
      u_shapeScale: props.shapeScale ?? defaultPreset.params.shapeScale,
      u_shape: props.shape ?? defaultPreset.params.shape,
    };
  }, [
    props.scale,
    props.rotation,
    props.color1,
    props.color2,
    props.color3,
    props.proportion,
    props.softness,
    props.distortion,
    props.swirl,
    props.swirlIterations,
    props.shapeScale,
    props.shape,
  ]);

  return <ShaderMount {...props} fragmentShader={warpFragmentShader} uniforms={uniforms} />;
};
