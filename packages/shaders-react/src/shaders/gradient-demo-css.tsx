import { memo, useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import {
  getShaderColorFromString,
  gradientDemoCSSFragmentShader,
  type GradientDemoCSSUniforms,
} from '@paper-design/shaders';
import { colorPropsAreEqual } from '../color-props-are-equal';

export type GradientDemoCSSParams = {
  colors?: string[];
  test?: number;
} & GlobalParams;

export type GradientDemoCSSProps = Omit<ShaderMountProps, 'fragmentShader'> & GradientDemoCSSParams;

type GradientDemoCSSPreset = { name: string; params: Required<GradientDemoCSSParams> };

// Due to Leva controls limitation:
// 1) keep default colors in HSLA format to keep alpha channel
// 2) don't use decimal values on HSL values (to avoid button highlight bug)

export const defaultPreset: GradientDemoCSSPreset = {
  name: 'Default',
  params: {
    speed: 0.15,
    test: 0,
    frame: 0,
    colors: [
      'hsla(0, 100%, 50%, 1)',
      'hsla(240, 100%, 50%, 1)',
      'hsla(259, 29%, 73%, 1)',
      'hsla(263, 57%, 39%, 1)',
      'hsla(48, 73%, 84%, 1)',
      'hsla(295, 32%, 70%, 1)',
    ],
  },
};

export const beachPreset: GradientDemoCSSPreset = {
  name: 'Beach',
  params: {
    speed: 0.1,
    test: 0,
    frame: 0,
    colors: ['#ff0000', '#0000ff'],
  },
};

export const fadedPreset: GradientDemoCSSPreset = {
  name: 'Faded',
  params: {
    speed: -0.3,
    test: 0,
    frame: 0,
    colors: ['hsla(186, 41%, 90%, 1)', 'hsla(208, 71%, 85%, 1)', 'hsla(183, 51%, 92%, 1)', 'hsla(201, 72%, 90%, 1)'],
  },
};

export const gradientDemoCSSPresets: GradientDemoCSSPreset[] = [defaultPreset, beachPreset, fadedPreset];

function GradientDemoCSSImpl({ test, colors: colorsProp, ...props }: GradientDemoCSSProps) {
  const uniforms: GradientDemoCSSUniforms = useMemo(() => {
    let colors = colorsProp?.map((color) => getShaderColorFromString(color));
    if (!colors) {
      colors = defaultPreset.params.colors.map((color) => getShaderColorFromString(color));
    }

    return {
      u_test: test ?? defaultPreset.params.test,
      u_colors: colors,
      u_colors_count: colors.length,
    };
  }, [colorsProp, test]);

  return <ShaderMount {...props} fragmentShader={gradientDemoCSSFragmentShader} uniforms={uniforms} />;
}

type GradientDemoCSSComponent = React.MemoExoticComponent<(props: GradientDemoCSSProps) => React.ReactElement>;
export const GradientDemoCSS: GradientDemoCSSComponent = memo(GradientDemoCSSImpl, colorPropsAreEqual);
