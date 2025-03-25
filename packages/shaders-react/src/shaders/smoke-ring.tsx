import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, smokeRingFragmentShader, type SmokeRingUniforms } from '@paper-design/shaders';

export type SmokeRingParams = {
  colorInner?: string;
  colorOuter?: string;
  scale?: number;
  noiseScale?: number;
  thickness?: number;
} & GlobalParams;

export type SmokeRingProps = Omit<ShaderMountProps, 'fragmentShader'> & SmokeRingParams;

type SmokeRingPreset = { name: string; params: Required<SmokeRingParams>; style?: React.CSSProperties };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: SmokeRingPreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.5,
    frame: 0,
    colorInner: 'hsla(0, 0%, 100%, 1)',
    colorOuter: 'hsla(38, 4%, 38%, 1)',
    noiseScale: 1,
    thickness: 0.5,
  },
};

export const cloudPreset: SmokeRingPreset = {
  name: 'Cloud',
  params: {
    scale: 1,
    speed: 1,
    frame: 0,
    colorInner: 'hsla(0, 0%, 100%, 1)',
    colorOuter: 'hsla(0, 0%, 100%, 1)',
    noiseScale: 1.8,
    thickness: 0.7,
  },
  style: {
    background: 'hsla(218, 100%, 62%, 1)',
  },
};

export const firePreset: SmokeRingPreset = {
  name: 'Fire',
  params: {
    scale: 1,
    speed: 4,
    frame: 0,
    colorInner: 'hsla(40, 100%, 50%, 1)',
    colorOuter: 'hsla(0, 100%, 50%, 1)',
    noiseScale: 1.4,
    thickness: 0.35,
  },
  style: {
    background: 'hsla(20, 100%, 5%, 1)',
  },
};

export const electricPreset: SmokeRingPreset = {
  name: 'Electric',
  params: {
    scale: 1,
    speed: -2.5,
    frame: 0,
    colorInner: 'hsla(47, 100%, 64%, 1)',
    colorOuter: 'hsla(47, 100%, 64%, 1)',
    noiseScale: 1.8,
    thickness: 0.1,
  },
  style: {
    background: 'hsla(47, 50%, 7%, 1)',
  },
};

export const poisonPreset: SmokeRingPreset = {
  name: 'Poison',
  params: {
    scale: 1,
    speed: 3,
    frame: 0,
    colorInner: 'hsla(120, 100%, 3%, 1)',
    colorOuter: 'hsla(120, 100%, 66%, 1)',
    noiseScale: 5,
    thickness: 0.6,
  },
  style: {
    background: 'hsla(120, 100%, 3%, 1)',
  },
};

export const smokeRingPresets: SmokeRingPreset[] = [
  defaultPreset,
  cloudPreset,
  firePreset,
  electricPreset,
  poisonPreset,
];

export const SmokeRing = (props: SmokeRingProps): React.ReactElement => {
  const uniforms: SmokeRingUniforms = useMemo(() => {
    return {
      u_scale: props.scale ?? defaultPreset.params.scale,
      u_colorInner: getShaderColorFromString(props.colorInner, defaultPreset.params.colorInner),
      u_colorOuter: getShaderColorFromString(props.colorOuter, defaultPreset.params.colorOuter),
      u_noiseScale: props.noiseScale ?? defaultPreset.params.noiseScale,
      u_thickness: props.thickness ?? defaultPreset.params.thickness,
    };
  }, [props.scale, props.colorInner, props.colorOuter, props.noiseScale, props.thickness]);

  return <ShaderMount {...props} fragmentShader={smokeRingFragmentShader} uniforms={uniforms} />;
};
