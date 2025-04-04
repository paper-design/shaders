import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, ditheringFragmentShader, type DitheringUniforms } from '@paper-design/shaders';

export type DitheringParams = {
  scale?: number;
  shape?: number;
  color1?: string;
  color2?: string;
  type?: number;
  pxSize?: number;
  pxRounded?: boolean;
} & GlobalParams;

export type DitheringProps = Omit<ShaderMountProps, 'fragmentShader'> & DitheringParams;

type DitheringPreset = { name: string; params: Required<DitheringParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: DitheringPreset = {
  name: 'Default',
  params: {
    scale: 1,
    shape: 1,
    speed: 1,
    color1: 'hsla(240, 14%, 17%, 1)',
    color2: 'hsla(34, 26%, 61%, 1)',
    type: 3,
    pxSize: 4,
    pxRounded: true,
    frame: 0,
  },
} as const;

export const warpPreset: DitheringPreset = {
  name: 'Warp',
  params: {
    scale: 1,
    shape: 2,
    speed: 1,
    color1: 'hsla(195, 47%, 35%, 1)',
    color2: 'hsla(171, 26%, 89%, 1)',
    type: 4,
    pxSize: 2,
    pxRounded: true,
    frame: 0,
  },
} as const;

export const sinePreset: DitheringPreset = {
  name: 'Sine Wave',
  params: {
    scale: 2.7,
    shape: 3,
    speed: 1,
    color1: 'hsla(15, 80%, 25%, 1)',
    color2: 'hsla(55, 100%, 40%, 1)',
    type: 4,
    pxSize: 11,
    pxRounded: true,
    frame: 0,
  },
} as const;

export const bugsPreset: DitheringPreset = {
  name: 'Bugs',
  params: {
    scale: 1.5,
    shape: 4,
    speed: 1,
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(120, 80%, 50%, 1)',
    type: 1,
    pxSize: 9,
    pxRounded: true,
    frame: 0,
  },
} as const;

export const ripplePreset: DitheringPreset = {
  name: 'Ripple',
  params: {
    scale: 1,
    shape: 5,
    speed: 1,
    color1: 'hsla(20, 50%, 25%, 1)',
    color2: 'hsla(20, 50%, 55%, 1)',
    type: 2,
    pxSize: 3,
    pxRounded: false,
    frame: 0,
  },
} as const;

export const swirlPreset: DitheringPreset = {
  name: 'Swirl',
  params: {
    scale: 1,
    shape: 6,
    speed: 1,
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(200, 26%, 20%, 1)',
    type: 4,
    pxSize: 2,
    pxRounded: false,
    frame: 0,
  },
} as const;

export const spherePreset: DitheringPreset = {
  name: 'Sphere',
  params: {
    scale: 1,
    shape: 7,
    speed: 1,
    color1: 'hsla(320, 26%, 15%, 1)',
    color2: 'hsla(135, 30%, 30%, 1)',
    type: 3,
    pxSize: 2.5,
    pxRounded: true,
    frame: 0,
  },
} as const;

export const ditheringPresets: DitheringPreset[] = [defaultPreset, spherePreset, warpPreset, sinePreset, ripplePreset, bugsPreset, swirlPreset];

export const Dithering = ({
  scale,
  shape,
  color1,
  color2,
  type,
  pxSize,
  pxRounded,
  ...props
}: DitheringProps): React.ReactElement => {
  const uniforms: DitheringUniforms = useMemo(() => {
    return {
      u_scale: scale ?? defaultPreset.params.scale,
      u_shape: shape ?? defaultPreset.params.shape,
      u_color1: getShaderColorFromString(color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(color2, defaultPreset.params.color2),
      u_type: type ?? defaultPreset.params.type,
      u_pxSize: pxSize ?? defaultPreset.params.pxSize,
      u_pxRounded: pxRounded ?? defaultPreset.params.pxRounded,
    };
  }, [scale, shape, color1, color2, type, pxSize, pxRounded]);

  return <ShaderMount {...props} fragmentShader={ditheringFragmentShader} uniforms={uniforms} />;
};
