import { useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, meshGradientFragmentShader, type MeshGradientUniforms } from '@paper-design/shaders';

export type MeshGradientParams = {
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
} & GlobalParams;

export type MeshGradientProps = Omit<Partial<ShaderMountProps>, 'fragmentShader'> & MeshGradientParams;

type MeshGradientPreset = { name: string; params: Required<MeshGradientParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: MeshGradientPreset = {
  name: 'Default',
  params: {
    speed: 0.15,
    frame: 0,
    color1: 'hsla(259, 29%, 73%, 1)',
    color2: 'hsla(263, 57%, 39%, 1)',
    color3: 'hsla(48, 73%, 84%, 1)',
    color4: 'hsla(295, 32%, 70%, 1)',
  },
};

export const beachPreset: MeshGradientPreset = {
  name: 'Beach',
  params: {
    speed: 0.1,
    frame: 0,
    color1: 'hsla(186, 81%, 83%, 1)',
    color2: 'hsla(198, 55%, 68%, 1)',
    color3: 'hsla(53, 67%, 88%, 1)',
    color4: 'hsla(45, 93%, 73%, 1)',
  },
};

export const fadedPreset: MeshGradientPreset = {
  name: 'Faded',
  params: {
    speed: -0.3,
    frame: 0,
    color1: 'hsla(186, 41%, 90%, 1)',
    color2: 'hsla(208, 71%, 85%, 1)',
    color3: 'hsla(183, 51%, 92%, 1)',
    color4: 'hsla(201, 72%, 90%, 1)',
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset, beachPreset, fadedPreset];

export const MeshGradient = ({
  color1,
  color2,
  color3,
  color4,
  worldFit = 'cover',
  worldWidth = 0,
  worldHeight = 0,
  ...props
}: MeshGradientProps): React.ReactElement => {
  const uniforms: MeshGradientUniforms = useMemo(() => {
    return {
      u_color1: getShaderColorFromString(color1, defaultPreset.params.color1),
      u_color2: getShaderColorFromString(color2, defaultPreset.params.color2),
      u_color3: getShaderColorFromString(color3, defaultPreset.params.color3),
      u_color4: getShaderColorFromString(color4, defaultPreset.params.color4),
    };
  }, [color1, color2, color3, color4]);

  return (
    <ShaderMount
      {...props}
      worldFit={worldFit}
      worldWidth={worldWidth}
      worldHeight={worldHeight}
      fragmentShader={meshGradientFragmentShader}
      uniforms={uniforms}
    />
  );
};
