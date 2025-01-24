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
    speed: 0.3,
    seed: 0,
    color1: 'hsla(0, 0%, 15%, 1)',
    color2: 'hsla(203, 80%, 70%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    proportion: 0.5,
    softness: 1,
    distortion: 0.25,
    swirl: 0.9,
    swirlIterations: 10,
    shapeScale: 0.5,
    shape: PatternShapes.Checks,
  },
};

export const preset1: WarpPreset = {
  name: 'Preset #1',
  params: {
    scale: 0.96,
    rotation: 1.62,
    speed: 1,
    seed: 0,
    color1: 'hsla(147, 51%, 61%, 1)',
    color2: 'hsla(220, 39%, 32%, 1)',
    color3: 'hsla(0, 0%, 19%, 1)',
    proportion: 1,
    softness: 0.95,
    distortion: 0.18,
    swirl: 0.65,
    swirlIterations: 7,
    shapeScale: 0,
    shape: PatternShapes.Edge,
  },
};

export const preset2: WarpPreset = {
  name: 'Preset #2',
  params: {
    scale: 0.3,
    rotation: 0,
    speed: 0.2,
    seed: 0,
    color1: 'hsla(70, 100%, 70%, 1)',
    color2: 'hsla(200, 100%, 70%, 1)',
    color3: 'hsla(0, 100%, 70%, 1)',
    proportion: 0.43,
    softness: 1,
    distortion: 0.1,
    swirl: 0.88,
    swirlIterations: 20,
    shapeScale: 0.5,
    shape: PatternShapes.Checks,
  },
};

export const preset3: WarpPreset = {
  name: 'Preset #3',
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
    swirlIterations: 10,
    shapeScale: 0.05,
    shape: PatternShapes.Stripes,
  },
};

export const warpPresets: WarpPreset[] = [defaultPreset, preset1, preset2, preset3];

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
