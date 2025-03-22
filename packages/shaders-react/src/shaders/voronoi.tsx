import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, voronoiFragmentShader, type VoronoiUniforms } from '@paper-design/shaders';

export type VoronoiParams = {
  scale?: number;
  colorCell1?: string;
  colorCell2?: string;
  colorCell3?: string;
  colorMid?: string;
  colorEdges?: string;
  colorGradient?: number;
  distance?: number;
  edgesSize?: number;
  edgesSoftness?: number;
  middleSize?: number;
  middleSoftness?: number;
} & GlobalParams;

export type VoronoiProps = Omit<ShaderMountProps, 'fragmentShader'> & VoronoiParams;

type VoronoiPreset = { name: string; params: Required<VoronoiParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: VoronoiPreset = {
  name: 'Default',
  params: {
    scale: 1.5,
    speed: 0.5,
    seed: 0,
    colorCell1: 'hsla(15, 80%, 50%, 1)',
    colorCell2: 'hsla(180, 80%, 50%, 1)',
    colorCell3: 'hsla(200, 80%, 50%, 1)',
    colorEdges: 'hsla(30, 90%, 10%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 0.5,
    distance: 0.25,
    edgesSize: 0.15,
    edgesSoftness: 0.01,
    middleSize: 0,
    middleSoftness: 0,
  },
} as const;

export const classicPreset: VoronoiPreset = {
  name: 'Classic',
  params: {
    scale: 3,
    speed: 0.8,
    seed: 0,
    colorCell1: 'hsla(0, 100%, 100%, 1)',
    colorCell2: 'hsla(0, 0%, 100%, 1)',
    colorCell3: 'hsla(0, 100%, 0%, 1)',
    colorEdges: 'hsla(0, 0%, 0%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 1,
    distance: 0.45,
    edgesSize: 0.02,
    edgesSoftness: 0.07,
    middleSize: 0,
    middleSoftness: 0,
  },
} as const;

export const giraffePreset: VoronoiPreset = {
  name: 'Giraffe',
  params: {
    scale: 1,
    speed: 0.6,
    seed: 0,
    colorCell1: 'hsla(32, 100%, 18%, 1)',
    colorCell2: 'hsla(42, 93%, 35%, 1)',
    colorCell3: 'hsla(32, 100%, 18%, 1)',
    colorEdges: 'hsla(45, 100%, 96%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 1,
    distance: 0.25,
    edgesSize: 0.2,
    edgesSoftness: 0.01,
    middleSize: 0,
    middleSoftness: 0,
  },
} as const;

export const eyesPreset: VoronoiPreset = {
  name: 'Eyes',
  params: {
    scale: 1.6,
    speed: 0.6,
    seed: 0,
    colorCell1: 'hsla(79, 84%, 60%, 1)',
    colorCell2: 'hsla(207, 53%, 41%, 1)',
    colorCell3: 'hsla(207, 80%, 65%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(0, 100%, 100%, 1)',
    colorGradient: 1,
    distance: 0.25,
    edgesSize: 0.62,
    edgesSoftness: 0.01,
    middleSize: 0.1,
    middleSoftness: 0,
  },
} as const;

export const bubblesPreset: VoronoiPreset = {
  name: 'Bubbles',
  params: {
    scale: 2,
    speed: 0.5,
    seed: 0,
    colorCell1: 'hsla(0, 100%, 50%, 1)',
    colorCell2: 'hsla(169, 100%, 66%, 1)',
    colorCell3: 'hsla(50, 100%, 66%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 1,
    distance: 0.5,
    edgesSize: 0.81,
    edgesSoftness: 0.0,
    middleSize: 0,
    middleSoftness: 0,
  },
} as const;

export const cellsPreset: VoronoiPreset = {
  name: 'Cells',
  params: {
    scale: 2,
    speed: 1,
    seed: 0,
    colorCell1: 'hsla(0, 0%, 100%, 1)',
    colorCell2: 'hsla(0, 0%, 100%, 1)',
    colorCell3: 'hsla(0, 0%, 100%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(200, 50%, 15%, 1)',
    colorGradient: 1,
    distance: 0.38,
    edgesSize: 0.1,
    edgesSoftness: 0.02,
    middleSize: 0,
    middleSoftness: 0,
  },
} as const;

export const glowPreset: VoronoiPreset = {
  name: 'Glow',
  params: {
    scale: 1.2,
    speed: 0.8,
    seed: 0,
    colorCell1: 'hsla(40, 100%, 50%, 1)',
    colorCell2: 'hsla(311, 100%, 59%, 1)',
    colorCell3: 'hsla(180, 100%, 65%, 1)',
    colorEdges: 'hsla(0, 100%, 0%, 1)',
    colorMid: 'hsla(0, 0%, 100%, 1)',
    colorGradient: 1,
    distance: 0.25,
    edgesSize: 0.15,
    edgesSoftness: 0.01,
    middleSize: 0.7,
    middleSoftness: 1,
  },
} as const;

export const tilesPreset: VoronoiPreset = {
  name: 'Tiles',
  params: {
    scale: 1.3,
    speed: 1,
    seed: 0,
    colorCell1: 'hsla(80, 50%, 50%, 1)',
    colorCell2: 'hsla(0, 50%, 100%, 1)',
    colorCell3: 'hsla(200, 50%, 50%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(200, 50%, 10%, 1)',
    colorGradient: 0,
    distance: 0.05,
    edgesSize: 0.25,
    edgesSoftness: 0.02,
    middleSize: 0,
    middleSoftness: 0,
  },
} as const;

export const voronoiPresets: VoronoiPreset[] = [
  defaultPreset,
  classicPreset,
  giraffePreset,
  eyesPreset,
  bubblesPreset,
  cellsPreset,
  glowPreset,
  tilesPreset,
];

export const Voronoi = (props: VoronoiProps): JSX.Element => {
  const uniforms: VoronoiUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_colorCell1: getShaderColorFromString(props.colorCell1, defaultPreset.params.colorCell1),
      u_colorCell2: getShaderColorFromString(props.colorCell2, defaultPreset.params.colorCell2),
      u_colorCell3: getShaderColorFromString(props.colorCell3, defaultPreset.params.colorCell3),
      u_colorMid: getShaderColorFromString(props.colorMid, defaultPreset.params.colorMid),
      u_colorEdges: getShaderColorFromString(props.colorEdges, defaultPreset.params.colorEdges),
      u_colorGradient: props.colorGradient ?? defaultPreset.params.colorGradient,
      u_distance: props.distance ?? defaultPreset.params.distance,
      u_edgesSize: props.edgesSize ?? defaultPreset.params.edgesSize,
      u_edgesSoftness: props.edgesSoftness ?? defaultPreset.params.edgesSoftness,
      u_middleSize: props.middleSize ?? defaultPreset.params.middleSize,
      u_middleSoftness: props.middleSoftness ?? defaultPreset.params.middleSoftness,
    };
  }, [
    props.scale,
    props.colorCell1,
    props.colorCell3,
    props.colorCell2,
    props.colorMid,
    props.colorEdges,
    props.colorGradient,
    props.distance,
    props.edgesSize,
    props.edgesSoftness,
    props.middleSize,
    props.middleSoftness,
  ]);

  return <ShaderMount {...props} fragmentShader={voronoiFragmentShader} uniforms={uniforms} />;
};
