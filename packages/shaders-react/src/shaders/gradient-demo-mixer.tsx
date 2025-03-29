import { memo, useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  gradientDemoMixerFragmentShader,
  type GradientDemoMixerUniforms,
} from '@paper-design/shaders';
import { colorPropsAreEqual } from '../color-props-are-equal';

export type GradientDemoMixerParams = {
  colors?: string[];
  shape?: number;
  softness?: number;
  bNoise?: number;
  test?: number;
  extraSides?: boolean;
} & GlobalParams;

export type GradientDemoMixerProps = Omit<ShaderMountProps, 'fragmentShader'> & GradientDemoMixerParams;

type GradientDemoMixerPreset = { name: string; params: Required<GradientDemoMixerParams>; style?: React.CSSProperties };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: GradientDemoMixerPreset = {
  name: 'Default',
  params: {
    speed: 0.15,
    shape: 1,
    softness: 0,
    bNoise: 1,
    test: 2,
    extraSides: true,
    frame: 0,
    colors: ['hsla(259, 29%, 73%, 1)', 'hsla(263, 57%, 39%, 1)', 'hsla(48, 73%, 84%, 1)', 'hsla(295, 32%, 70%, 1)'],
  },
};
export const bandingPreset: GradientDemoMixerPreset = {
  name: 'banding',
  params: {
    speed: 0.15,
    shape: 0.6,
    softness: 1,
    bNoise: 0,
    test: 1,
    extraSides: true,
    frame: 0,
    colors: ['#332848', '#094008'],
  },
};

export const gradientDemoMixerPresets: GradientDemoMixerPreset[] = [defaultPreset, bandingPreset];

function GradientDemoMixerImpl({
  shape,
  bNoise,
  extraSides,
  softness,
  test,
  colors: colorsProp,
  ...props
}: GradientDemoMixerProps) {
  const uniforms: GradientDemoMixerUniforms = useMemo(() => {
    let colors = colorsProp?.map((color) => getShaderColorFromString(color));
    if (!colors) {
      colors = defaultPreset.params.colors.map((color) => getShaderColorFromString(color));
    }

    return {
      u_shape: shape ?? defaultPreset.params.shape,
      u_bNoise: bNoise ?? defaultPreset.params.bNoise,
      u_softness: softness ?? defaultPreset.params.softness,
      u_extraSides: extraSides ?? defaultPreset.params.extraSides,
      u_test: test ?? defaultPreset.params.test,
      u_colors: colors,
      u_colors_count: colors.length,
    };
  }, [colorsProp, bNoise, softness, extraSides, test, shape]);

  return <ShaderMount {...props} fragmentShader={gradientDemoMixerFragmentShader} uniforms={uniforms} />;
}

type GradientDemoMixerComponent = React.MemoExoticComponent<(props: GradientDemoMixerProps) => React.ReactElement>;
export const GradientDemoMixer: GradientDemoMixerComponent = memo(GradientDemoMixerImpl, colorPropsAreEqual);
