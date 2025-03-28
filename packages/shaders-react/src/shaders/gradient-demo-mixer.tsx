import { memo, useMemo } from 'react';
import { ShaderMount, type GlobalParams, type ShaderMountProps } from '../shader-mount';
import { getShaderColorFromString, gradientDemoMixerFragmentShader, type GradientDemoMixerUniforms } from '@paper-design/shaders';
import { colorPropsAreEqual } from '../color-props-are-equal';

export type GradientDemoMixerParams = {
  colors?: string[];
  test?: number;
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
    test: 1,
    frame: 0,
    // colors: ['hsla(259, 29%, 73%, 1)', 'hsla(263, 57%, 39%, 1)', 'hsla(48, 73%, 84%, 1)', 'hsla(295, 32%, 70%, 1)'],
    colors: ['hsla(259, 29%, 73%, 1)', 'hsla(263, 57%, 39%, 1)'],
  },
};

export const beachPreset: GradientDemoMixerPreset = {
  name: 'Beach',
  params: {
    speed: 0.1,
    test: 0.5,
    frame: 0,
    colors: ['hsla(186, 81%, 83%, 1)', 'hsla(198, 55%, 68%, 1)', 'hsla(53, 67%, 88%, 1)', 'hsla(45, 93%, 73%, 1)'],
  },
  style: {
    background: 'hsla(120, 100%, 3%, 1)',
  },
};

export const fadedPreset: GradientDemoMixerPreset = {
  name: 'Faded',
  params: {
    speed: -0.3,
    test: 0.75,
    frame: 0,
    colors: ['hsla(186, 41%, 90%, 1)', 'hsla(208, 71%, 85%, 1)', 'hsla(183, 51%, 92%, 1)', 'hsla(201, 72%, 90%, 1)'],
  },
  style: {
    background: 'hsla(120, 100%, 3%, 1)',
  },
};

export const gradientDemoMixerPresets: GradientDemoMixerPreset[] = [defaultPreset];

function GradientDemoMixerImpl({ test, colors: colorsProp, ...props }: GradientDemoMixerProps) {
  const uniforms: GradientDemoMixerUniforms = useMemo(() => {
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

  return <ShaderMount {...props} fragmentShader={gradientDemoMixerFragmentShader} uniforms={uniforms} />;
}

type GradientDemoMixerComponent = React.MemoExoticComponent<(props: GradientDemoMixerProps) => React.ReactElement>;
export const GradientDemoMixer: GradientDemoMixerComponent = memo(GradientDemoMixerImpl, colorPropsAreEqual);
