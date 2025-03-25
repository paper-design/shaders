import { memo, useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, meshGradientFragmentShader, type MeshGradientUniforms } from '@paper-design/shaders';
import { colorPropsAreEqual } from '../colors-are-equal';

export type MeshGradientParams = {
  colors?: string[];
} & GlobalParams;

export type MeshGradientProps = Omit<ShaderMountProps, 'fragmentShader'> & MeshGradientParams;

type MeshGradientPreset = { name: string; params: Required<MeshGradientParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: MeshGradientPreset = {
  name: 'Default',
  params: {
    speed: 0.15,
    seed: 0,
    colors: ['hsla(259, 29%, 73%, 1)', 'hsla(263, 57%, 39%, 1)', 'hsla(48, 73%, 84%, 1)', 'hsla(295, 32%, 70%, 1)'],
  },
} as const;

export const beachPreset: MeshGradientPreset = {
  name: 'Beach',
  params: {
    speed: 0.1,
    seed: 0,
    colors: ['hsla(186, 81%, 83%, 1)', 'hsla(198, 55%, 68%, 1)', 'hsla(53, 67%, 88%, 1)', 'hsla(45, 93%, 73%, 1)'],
  },
};

export const fadedPreset: MeshGradientPreset = {
  name: 'Faded',
  params: {
    speed: -0.3,
    seed: 0,
    colors: ['hsla(186, 41%, 90%, 1)', 'hsla(208, 71%, 85%, 1)', 'hsla(183, 51%, 92%, 1)', 'hsla(201, 72%, 90%, 1)'],
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset, beachPreset, fadedPreset];

function MeshGradientImpl(props: MeshGradientProps) {
  const uniforms: MeshGradientUniforms = useMemo(() => {
    let colors = props.colors?.map((color) => getShaderColorFromString(color));
    if (!colors) {
      colors = defaultPreset.params.colors.map((color) => getShaderColorFromString(color));
    }

    return {
      u_colors: colors,
      u_colors_count: colors.length,
    };
  }, [props.colors]);

  return <ShaderMount {...props} fragmentShader={meshGradientFragmentShader} uniforms={uniforms} />;
}

type MeshGradientComponent = React.MemoExoticComponent<(props: MeshGradientProps) => React.ReactElement>;
export const MeshGradient: MeshGradientComponent = memo(MeshGradientImpl, colorPropsAreEqual);
