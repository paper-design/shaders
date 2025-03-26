import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, ditheringFragmentShader, type DitheringUniforms } from '@paper-design/shaders';

export type DitheringParams = {
  scale?: number;
  shape?: number;
  color?: string;
  type?: number;
  pxSize?: number;
  pxRounded?: boolean;
} & GlobalParams;

export type DitheringProps = Omit<ShaderMountProps, 'fragmentShader'> & DitheringParams;

type DitheringPreset = { name: string; params: Required<DitheringParams>; style?: React.CSSProperties };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: DitheringPreset = {
  name: 'Default',
  params: {
    scale: 1,
    shape: 7,
    speed: 0.15,
    color: 'hsla(210, 50%, 50%, 1)',
    type: 3,
    pxSize: 4,
    pxRounded: true,
    frame: 0,
  },
} as const;

export const wavesPreset: DitheringPreset = {
  name: 'Waves',
  params: {
    scale: 0.85,
    shape: 2,
    speed: 0.6,
    color: 'hsla(38, 100%, 94%, 1)',
    type: 4,
    pxSize: 2,
    pxRounded: true,
    frame: 0,
  },
  style: {
    background: 'hsla(196, 32%, 45%, 1)',
  },
} as const;

export const borderPreset: DitheringPreset = {
  name: 'Border',
  params: {
    scale: 2,
    shape: 4,
    speed: 0,
    color: 'hsla(360, 75%, 35%, 1)',
    type: 4,
    pxSize: 2,
    pxRounded: true,
    frame: 0,
  },
} as const;

export const spherePreset: DitheringPreset = {
  name: 'Sphere',
  params: {
    scale: 1,
    shape: 6,
    speed: 0,
    color: 'hsla(320, 26%, 60%, 1)',
    type: 1,
    pxSize: 7,
    pxRounded: true,
    frame: 0,
  },
  style: {
    background: 'hsla(0, 0%, 0%, 1)',
  },
} as const;

export const ditheringPresets: DitheringPreset[] = [defaultPreset, wavesPreset, borderPreset, spherePreset];

export const Dithering = ({
  scale,
  shape,
  color,
  type,
  pxSize,
  pxRounded,
  ...props
}: DitheringProps): React.ReactElement => {
  const uniforms: DitheringUniforms = useMemo(() => {
    return {
      u_scale: scale ?? defaultPreset.params.scale,
      u_shape: shape ?? defaultPreset.params.shape,
      u_color: getShaderColorFromString(color, defaultPreset.params.color),
      u_type: type ?? defaultPreset.params.type,
      u_pxSize: pxSize ?? defaultPreset.params.pxSize,
      u_pxRounded: pxRounded ?? defaultPreset.params.pxRounded,
    };
  }, [scale, shape, color, type, pxSize, pxRounded]);

  return <ShaderMount {...props} fragmentShader={ditheringFragmentShader} uniforms={uniforms} />;
};
