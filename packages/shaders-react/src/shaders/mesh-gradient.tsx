import { memo, useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, meshGradientFragmentShader, type MeshGradientUniforms } from '@paper-design/shaders';
import { colorPropsAreEqual } from '../color-props-are-equal';

export type MeshGradientParams = {
  colors?: string[];
  softness?: number;
  test?: number;
  extraSides?: boolean;
} & GlobalParams;

export type MeshGradientProps = Omit<ShaderMountProps, 'fragmentShader'> & MeshGradientParams;

type MeshGradientPreset = { name: string; params: Required<MeshGradientParams>; style?: React.CSSProperties };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: MeshGradientPreset = {
  name: 'Default',
  params: {
    speed: 0.15,
    softness: 0,
    test: 2,
    extraSides: true,
    frame: 0,
    colors: ['hsla(259, 29%, 73%, 1)', 'hsla(263, 57%, 39%, 1)', 'hsla(48, 73%, 84%, 1)', 'hsla(295, 32%, 70%, 1)'],
  },
};

export const meshGradientPresets: MeshGradientPreset[] = [defaultPreset];

function MeshGradientImpl({ test, softness, extraSides, colors: colorsProp, ...props }: MeshGradientProps) {
  const uniforms: MeshGradientUniforms = useMemo(() => {
    let colors = colorsProp?.map((color) => getShaderColorFromString(color));
    if (!colors) {
      colors = defaultPreset.params.colors.map((color) => getShaderColorFromString(color));
    }

    return {
      u_softness: softness ?? defaultPreset.params.softness,
      u_extraSides: extraSides ?? defaultPreset.params.extraSides,
      u_test: test ?? defaultPreset.params.test,
      u_colors: colors,
      u_colors_count: colors.length,
    };
  }, [colorsProp, test, softness, extraSides]);

  return <ShaderMount {...props} fragmentShader={meshGradientFragmentShader} uniforms={uniforms} />;
}

type MeshGradientComponent = React.MemoExoticComponent<(props: MeshGradientProps) => React.ReactElement>;
export const MeshGradient: MeshGradientComponent = memo(MeshGradientImpl, colorPropsAreEqual);
