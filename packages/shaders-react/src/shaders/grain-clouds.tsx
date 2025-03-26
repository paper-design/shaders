import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, grainCloudsFragmentShader, type GrainCloudsUniforms } from '@paper-design/shaders';

export type GrainCloudsParams = {
  scale?: number;
  color1?: string;
  color2?: string;
  grainAmount?: number;
} & GlobalParams;

export type GrainCloudsProps = Omit<ShaderMountProps, 'fragmentShader'> & GrainCloudsParams;

type GrainCloudsPreset = { name: string; params: Required<GrainCloudsParams>; style?: React.CSSProperties };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: GrainCloudsPreset = {
  name: 'Default',
  params: {
    scale: 1,
    speed: 0.3,
    frame: 0,
    color1: 'hsla(0, 0%, 0%, 1)',
    color2: 'hsla(0, 0%, 100%, 1)',
    grainAmount: 1,
  },
};

export const skyPreset: GrainCloudsPreset = {
  name: 'Sky',
  params: {
    scale: 1,
    speed: 0.3,
    frame: 0,
    color1: 'hsla(218, 100%, 73%, 1)',
    color2: 'hsla(0, 0%, 100%, 1)',
    grainAmount: 0,
  },
};

export const grainCloudsPresets: GrainCloudsPreset[] = [defaultPreset, skyPreset];

export const GrainClouds = ({ scale, color1, color2, grainAmount, ...props }: GrainCloudsProps): React.ReactElement => {
  const uniforms: GrainCloudsUniforms = useMemo(() => {
    return {
      u_scale: scale ?? defaultPreset.params.scale,
      u_color1: getShaderColorFromString(color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(color2, defaultPreset.params.color2),
      u_grainAmount: grainAmount ?? defaultPreset.params.grainAmount,
    };
  }, [scale, color1, color2, grainAmount]);

  return <ShaderMount {...props} fragmentShader={grainCloudsFragmentShader} uniforms={uniforms} />;
};
