import {useMemo} from 'react';
import {ShaderMount, type GlobalParams, type ShaderMountProps} from '../shader-mount';
import {getShaderColorFromString, voronoiFragmentShader, type VoronoiUniforms} from '@paper-design/shaders';

export type VoronoiParams = {
    colorEdges?: string;
    colorCell1?: string;
    colorCell2?: string;
    colorMid1?: string;
    colorMid2?: string;
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
        colorEdges: 'hsla(30, 90%, 10%, 1)',
        colorCell1: 'hsla(72, 100%, 50%, 1)',
        colorCell2: 'hsla(173, 100%, 50%, 1)',
        colorMid1: 'hsla(236, 52%, 66%, 1)',
        colorMid2: 'hsla(237, 16%, 56%, 1)',
        scale: 1.5,
        distance: .25,
        edgesSize: .15,
        edgesSharpness: .01,
        middleSize: .75,
        middleSharpness: .3,
        speed: .5,
        seed: 0,
    },
} as const;

export const classicPreset: VoronoiPreset = {
    name: 'Classic',
    params: {
        // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
        // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
        colorEdges: 'hsla(0, 0%, 0%, 1)',
        colorCell1: 'hsla(200, 100%, 100%, 1)',
        colorCell2: 'hsla(0, 0%, 0%, 1)',
        colorMid1: 'hsla(0, 0%, 0%, 1)',
        colorMid2: 'hsla(0, 0%, 0%, 1)',
        scale: 3,
        distance: .45,
        edgesSize: .02,
        edgesSharpness: .07,
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
        colorEdges: 'hsla(45, 100%, 96%, 1)',
        colorCell1: 'hsla(32, 100%, 18%, 1)',
        colorCell2: 'hsla(42, 100%, 24%, 1)',
        colorMid1: 'hsla(0, 0%, 0%, 1)',
        colorMid2: 'hsla(0, 0%, 0%, 1)',
        scale: 1,
        distance: .25,
        edgesSize: .2,
        edgesSharpness: .01,
        middleSize: 0,
        middleSharpness: .3,
        speed: 0.6,
        seed: 0,
    },
} as const;

export const eyesPreset: VoronoiPreset = {
    name: 'Eyes',
    params: {
        // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
        // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
        colorEdges: 'hsla(0, 100%, 100%, 1)',
        colorCell1: 'hsla(79, 84%, 80%, 1)',
        colorCell2: 'hsla(207, 53%, 41%, 1)',
        colorMid1: 'hsla(0, 0%, 0%, 1)',
        colorMid2: 'hsla(0, 0%, 0%, 1)',
        scale: 1.6,
        distance: .25,
        edgesSize: .62,
        edgesSharpness: .01,
        middleSize: .1,
        middleSharpness: 1,
        speed: .6,
        seed: 0,
    },
} as const;

export const bubblesPreset: VoronoiPreset = {
    name: 'Bubbles',
    params: {
        // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
        // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
        colorEdges: 'hsla(0, 0%, 0%, 1)',
        colorCell1: 'hsla(0, 0%, 0%, 1)',
        colorCell2: 'hsla(0, 0%, 0%, 1)',
        colorMid1: 'hsla(169, 100%, 66%, 1)',
        colorMid2: 'hsla(0, 100%, 50%, 1)',
        scale: 2,
        distance: .5,
        edgesSize: .81,
        edgesSharpness: .0,
        middleSize: 1,
        middleSharpness: .45,
        speed: .5,
        seed: 0,
    },
} as const;

export const cellsPreset: VoronoiPreset = {
    name: 'Cells',
    params: {
        // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
        // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
        colorEdges: 'hsla(200, 50%, 15%, 1)',
        colorCell1: 'hsla(0, 0%, 100%, 1)',
        colorCell2: 'hsla(0, 0%, 100%, 1)',
        colorMid1: 'hsla(0, 0%, 0%, 1)',
        colorMid2: 'hsla(0, 0%, 0%, 1)',
        scale: 2,
        distance: .38,
        edgesSize: .1,
        edgesSharpness: .02,
        middleSize: 0,
        middleSharpness: 0,
        speed: 1,
        seed: 0,
    },
} as const;

export const tilesPreset: VoronoiPreset = {
    name: 'Tiles',
    params: {
        // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
        // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
        colorEdges: 'hsla(200, 50%, 10%, 1)',
        colorCell1: 'hsla(80, 50%, 50%, 1)',
        colorCell2: 'hsla(0, 50%, 50%, 1)',
        colorMid1: 'hsla(0, 0%, 0%, 1)',
        colorMid2: 'hsla(0, 0%, 0%, 1)',
        scale: 1.3,
        distance: .05,
        edgesSize: .25,
        edgesSharpness: .02,
        middleSize: 0,
        middleSharpness: 0,
        speed: 1,
        seed: 0,
    },
} as const;

export const voronoiPresets: VoronoiPreset[] = [defaultPreset, classicPreset, giraffePreset, eyesPreset, bubblesPreset, cellsPreset, tilesPreset];

export const Voronoi = (props: VoronoiProps): JSX.Element => {
    const uniforms: VoronoiUniforms = useMemo(() => {
        return {
            u_colorEdges: getShaderColorFromString(props.colorEdges, defaultPreset.params.colorEdges),
            u_colorCell1: getShaderColorFromString(props.colorCell1, defaultPreset.params.colorCell1),
            u_colorCell2: getShaderColorFromString(props.colorCell2, defaultPreset.params.colorCell2),
            u_colorMid1: getShaderColorFromString(props.colorMid1, defaultPreset.params.colorMid1),
            u_colorMid2: getShaderColorFromString(props.colorMid2, defaultPreset.params.colorMid2),
            u_scale: props.scale ?? defaultPreset.params.scale,
            u_distance: props.distance ?? defaultPreset.params.distance,
            u_edgesSize: props.edgesSize ?? defaultPreset.params.edgesSize,
            u_edgesSharpness: props.edgesSharpness ?? defaultPreset.params.edgesSharpness,
            u_middleSize: props.middleSize ?? defaultPreset.params.middleSize,
            u_middleSharpness: props.middleSharpness ?? defaultPreset.params.middleSharpness,
        };
    }, [props.colorEdges, props.colorCell1, props.colorCell2, props.colorMid1, props.colorMid2, props.scale, props.distance, props.edgesSize, props.edgesSharpness, props.middleSize, props.middleSharpness]);

    return <ShaderMount {...props} fragmentShader={voronoiFragmentShader} uniforms={uniforms}/>;
};