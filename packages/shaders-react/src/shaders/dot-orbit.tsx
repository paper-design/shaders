import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, dotOrbitFragmentShader, type DotOrbitUniforms } from '@paper-design/shaders';

export type DotOrbitParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  dotSize?: number;
  dotSizeRange?: number;
  spreading?: number;
} & GlobalParams;

export type DotOrbitProps = Omit<ShaderMountProps, 'fragmentShader'> & DotOrbitParams;

type DotOrbitPreset = { name: string; params: Required<DotOrbitParams>; style?: React.CSSProperties };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: DotOrbitPreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 2,
    frame: 0,
    color1: 'hsla(358, 66%, 49%, 1)',
    color2: 'hsla(145, 30%, 33%, 1)',
    color3: 'hsla(39, 88%, 52%, 1)',
    color4: 'hsla(274, 30%, 35%, 1)',
    dotSize: 0.7,
    dotSizeRange: 0.4,
    spreading: 1,
  },
};

export const dotOrbitPresets: DotOrbitPreset[] = [defaultPreset];

export const DotOrbit = ({
  scale,
  color1,
  color2,
  color3,
  color4,
  dotSize,
  dotSizeRange,
  spreading,
  ...props
}: DotOrbitProps): React.ReactElement => {
  const uniforms: DotOrbitUniforms = useMemo(() => {
    return {
      u_scale: scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(color4, defaultPreset.params.color4),
      u_dotSize: dotSize ?? defaultPreset.params.dotSize,
      u_dotSizeRange: dotSizeRange ?? defaultPreset.params.dotSizeRange,
      u_spreading: spreading ?? defaultPreset.params.spreading,
    };
  }, [scale, color1, color2, color3, color4, dotSize, dotSizeRange, spreading]);

  return <ShaderMount {...props} fragmentShader={dotOrbitFragmentShader} uniforms={uniforms} />;
};
