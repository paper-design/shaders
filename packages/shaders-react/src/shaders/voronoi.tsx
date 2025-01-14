import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, voronoiFragmentShader, type VoronoiUniforms } from '@paper-design/shaders';

export type VoronoiParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  colorMid?: string;
  colorEdges?: string;
  colorGradient?: number;
  scale?: number;
  distance?: number;
  edgesSize?: number;
  edgesSharpness?: number;
  middleSize?: number;
  middleSharpness?: number;
} & GlobalParams;

export type VoronoiProps = Omit<ShaderMountProps, 'fragmentShader'> & VoronoiParams;

type VoronoiPreset = { name: string; params: Required<VoronoiParams> };

export const defaultPreset: VoronoiPreset = {
  name: 'Default',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(15, 80%, 50%, 1)',
    color2: 'hsla(180, 80%, 50%, 1)',
    color3: 'hsla(200, 80%, 50%, 1)',
    colorEdges: 'hsla(30, 90%, 10%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorGradient: .5,
    scale: 1.5,
    distance: 0.25,
    edgesSize: 0.15,
    edgesSharpness: 0.01,
    middleSize: 0,
    middleSharpness: 0.3,
    speed: 0.5,
    seed: 0,
  },
} as const;

export const classicPreset: VoronoiPreset = {
  name: 'Classic',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(0, 100%, 100%, 1)',
    color2: 'hsla(0, 0%, 100%, 1)',
    color3: 'hsla(0, 100%, 0%, 1)',
    colorEdges: 'hsla(0, 0%, 0%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 1,
    scale: 3,
    distance: 0.45,
    edgesSize: 0.02,
    edgesSharpness: 0.07,
    middleSize: 0,
    middleSharpness: 0,
    speed: 0.8,
    seed: 0,
  },
} as const;

export const giraffePreset: VoronoiPreset = {
  name: 'Giraffe',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(32, 100%, 18%, 1)',
    color2: 'hsla(42, 93%, 35%, 1)',
    color3: 'hsla(32, 100%, 18%, 1)',
    colorEdges: 'hsla(45, 100%, 96%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 1,
    scale: 1,
    distance: 0.25,
    edgesSize: 0.2,
    edgesSharpness: 0.01,
    middleSize: 0,
    middleSharpness: 0.3,
    speed: 0.6,
    seed: 0,
  },
} as const;

export const eyesPreset: VoronoiPreset = {
  name: 'Eyes',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(79, 84%, 60%, 1)',
    color2: 'hsla(207, 53%, 41%, 1)',
    color3: 'hsla(207, 80%, 65%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(0, 100%, 100%, 1)',
    colorGradient: 1,
    scale: 1.6,
    distance: 0.25,
    edgesSize: 0.62,
    edgesSharpness: 0.01,
    middleSize: 0.1,
    middleSharpness: 1,
    speed: 0.6,
    seed: 0,
  },
} as const;

export const bubblesPreset: VoronoiPreset = {
  name: 'Bubbles',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(0, 100%, 50%, 1)',
    color2: 'hsla(169, 100%, 66%, 1)',
    color3: 'hsla(50, 100%, 66%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(0, 0%, 0%, 1)',
    colorGradient: 1,
    scale: 2,
    distance: 0.5,
    edgesSize: 0.81,
    edgesSharpness: 0.0,
    middleSize: 0,
    middleSharpness: 0.45,
    speed: 0.5,
    seed: 0,
  },
} as const;

export const cellsPreset: VoronoiPreset = {
  name: 'Cells',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(0, 0%, 100%, 1)',
    color2: 'hsla(0, 0%, 100%, 1)',
    color3: 'hsla(0, 0%, 100%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(200, 50%, 15%, 1)',
    colorGradient: 1,
    scale: 2,
    distance: 0.38,
    edgesSize: 0.1,
    edgesSharpness: 0.02,
    middleSize: 0,
    middleSharpness: 0,
    speed: 1,
    seed: 0,
  },
} as const;


export const glowPreset: VoronoiPreset = {
  name: 'Glow',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(40, 100%, 50%, 1)',
    color2: 'hsla(311, 100%, 59%, 1)',
    color3: 'hsla(180, 100%, 65%, 1)',
    colorEdges: 'hsla(0, 100%, 0%, 1)',
    colorMid: 'hsla(0, 0%, 100%, 1)',
    colorGradient: 1,
    scale: 1.2,
    distance: 0.25,
    edgesSize: 0.15,
    edgesSharpness: 0.01,
    middleSize: .7,
    middleSharpness: 0,
    speed: 0.8,
    seed: 0,
  },
} as const;

export const tilesPreset: VoronoiPreset = {
  name: 'Tiles',
  params: {
    // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
    // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
    color1: 'hsla(80, 50%, 50%, 1)',
    color2: 'hsla(0, 50%, 100%, 1)',
    color3: 'hsla(200, 50%, 50%, 1)',
    colorMid: 'hsla(0, 0%, 0%, 1)',
    colorEdges: 'hsla(200, 50%, 10%, 1)',
    colorGradient: 0,
    scale: 1.3,
    distance: 0.05,
    edgesSize: 0.25,
    edgesSharpness: 0.02,
    middleSize: 0,
    middleSharpness: 0,
    speed: 1,
    seed: 0,
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
      u_color1: getShaderColorFromString(props.color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(props.color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(props.color3, defaultPreset.params.color3),
      u_colorMid: getShaderColorFromString(props.colorMid, defaultPreset.params.colorMid),
      u_colorEdges: getShaderColorFromString(props.colorEdges, defaultPreset.params.colorEdges),
      u_colorGradient: props.colorGradient ?? defaultPreset.params.colorGradient,
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_distance: props.distance ?? defaultPreset.params.distance,
      u_edgesSize: props.edgesSize ?? defaultPreset.params.edgesSize,
      u_edgesSharpness: props.edgesSharpness ?? defaultPreset.params.edgesSharpness,
      u_middleSize: props.middleSize ?? defaultPreset.params.middleSize,
      u_middleSharpness: props.middleSharpness ?? defaultPreset.params.middleSharpness,
    };
  }, [
    props.color1,
    props.color3,
    props.color2,
    props.colorMid,
    props.colorEdges,
    props.colorGradient,
    props.scale,
    props.distance,
    props.edgesSize,
    props.edgesSharpness,
    props.middleSize,
    props.middleSharpness,
  ]);

  return <ShaderMount {...props} fragmentShader={voronoiFragmentShader} uniforms={uniforms} />;
};
