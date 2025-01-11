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
    edgeWidth?: number;
    midSize?: number;
    dotSharpness?: number;
} & GlobalParams;

export type VoronoiProps = Omit<ShaderMountProps, 'fragmentShader'> & VoronoiParams;

type VoronoiPreset = { name: string; params: Required<VoronoiParams> };

export const defaultPreset: VoronoiPreset = {
    name: 'Default',
    params: {
        // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
        // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
        colorEdges: 'hsla(30, 90%, 10%, 1)',
        colorCell1: 'hsla(236, 52%, 66%, 1)',
        colorCell2: 'hsla(237, 16%, 56%, 1)',
        colorMid1: 'hsla(70, 100%, 100%, 1)',
        colorMid2: 'hsla(173, 100%, 50%, 1)',
        scale: 10,
        edgeWidth: .12,
        midSize: .49,
        dotSharpness: .3,
        speed: .5,
        seed: 0,
    },
} as const;

export const classicPreset: VoronoiPreset = {
    name: 'Classic Voronoi',
    params: {
        // Note: Keep default colors in HSLA format so that our Leva controls show a transparency channel (rgba and hex8 do not work)
        // And don't use decimal values or highlights won't work, because the values get rounded and highlights need an exact match.
        colorEdges: 'hsla(45, 100%, 96%, 1)',
        colorCell1: 'hsla(200, 100%, 100%, 1)',
        colorCell2: 'hsla(200, 100%, 20%, 1)',
        colorMid1: 'hsla(0, 0%, 0%, 1)',
        colorMid2: 'hsla(0, 0%, 0%, 1)',
        scale: 18,
        edgeWidth: 0,
        midSize: 0,
        dotSharpness: 0,
        speed: 0.6,
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
        scale: 10,
        edgeWidth: .2,
        midSize: 0,
        dotSharpness: .3,
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
        scale: 12,
        edgeWidth: .7,
        midSize: .12,
        dotSharpness: 1,
        speed: .6,
        seed: 0,
    },
} as const;

export const voronoiPresets: VoronoiPreset[] = [defaultPreset, classicPreset, giraffePreset, eyesPreset];

export const Voronoi = (props: VoronoiProps): JSX.Element => {
    const uniforms: VoronoiUniforms = useMemo(() => {
        return {
            u_colorEdges: getShaderColorFromString(props.colorEdges, defaultPreset.params.colorEdges),
            u_colorCell1: getShaderColorFromString(props.colorCell1, defaultPreset.params.colorCell1),
            u_colorCell2: getShaderColorFromString(props.colorCell2, defaultPreset.params.colorCell2),
            u_colorMid1: getShaderColorFromString(props.colorMid1, defaultPreset.params.colorMid1),
            u_colorMid2: getShaderColorFromString(props.colorMid2, defaultPreset.params.colorMid2),
            u_scale: props.scale ?? defaultPreset.params.scale,
            u_edgeWidth: props.edgeWidth ?? defaultPreset.params.edgeWidth,
            u_midSize: props.midSize ?? defaultPreset.params.midSize,
            u_dotSharpness: props.dotSharpness ?? defaultPreset.params.dotSharpness,
        };
    }, [props.colorEdges, props.colorCell1, props.colorCell2, props.colorMid1, props.colorMid2, props.scale, props.edgeWidth, props.midSize, props.dotSharpness]);

    return <ShaderMount {...props} fragmentShader={voronoiFragmentShader} uniforms={uniforms}/>;
};