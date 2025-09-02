'use client';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';

import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '@paper-design/shaders-react';
import { getShaderColorFromString, type ShaderPreset } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { ShaderContainer } from '@/components/shader-container';

type vec4 = [number, number, number, number];
const gradientDemoMixerMaxColorCount = 10;

type GradientDemoMixerUniforms = {
  u_colors: vec4[];
  u_colorsCount: number;
  u_shape: number;
  u_softness: number;
  u_test: number;
  u_extraSides: boolean;
};

type GradientDemoMixerParams = {
  colors?: string[];
  shape?: number;
  softness?: number;
  test?: number;
  extraSides?: boolean;
};

const gradientDemoMixerFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_shape;
uniform float u_softness;
uniform vec4 u_colors[${gradientDemoMixerMaxColorCount}];
uniform float u_colorsCount;
uniform bool u_extraSides;
uniform float u_test;

out vec4 fragColor;


void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  float noise = (sin(gl_FragCoord.x * 1.2 + sin(gl_FragCoord.y * 1.2)) * .5 + .5);

  float shape = pow(uv.x, u_shape);


  float mixer = shape * (u_colorsCount - 1.);
  if (u_extraSides == true) {
    mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  }

  vec3 gradient = u_colors[0].rgb;

  for (int i = 1; i < ${gradientDemoMixerMaxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;
      float localT = clamp(mixer - float(i - 1), 0.0, 1.0);

      if (u_test == 0.) {

      } else if (u_test == 1.) {
        localT = smoothstep(.5 - .5 * u_softness, .5 + .5 * u_softness, localT);
      } else if (u_test == 2.) {
        localT = 1. / (1. + exp(-1. / (pow(u_softness, 4.) + 1e-3) * (localT - .5)));
      } else if (u_test == 3.) {
        localT = smoothstep(0., 1., localT);
        localT = 1. / (1. + exp(-1. / (pow(u_softness, 4.) + 1e-3) * (localT - .5)));
      }


      gradient = mix(gradient, u_colors[i].rgb, localT);
  }

  vec3 color = vec3(shape);
  if (uv.y < .5) {
   color = gradient;
  }

  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);

  fragColor = vec4(color, 1.);
}
`;

interface GradientDemoMixerProps extends ShaderComponentProps, GradientDemoMixerParams {}
type GradientDemoMixerPreset = ShaderPreset<GradientDemoMixerParams>;

const defaultPreset: GradientDemoMixerPreset = {
  name: 'Default',
  params: {
    shape: 1,
    softness: 0.5,
    test: 1,
    extraSides: true,
    colors: ['hsla(259, 29%, 73%, 1)', 'hsla(263, 57%, 39%, 1)', 'hsla(48, 73%, 84%, 1)', 'hsla(295, 32%, 70%, 1)'],
  },
};

const gradientDemoMixerPresets: GradientDemoMixerPreset[] = [defaultPreset];

const GradientDemoMixer: React.FC<GradientDemoMixerProps> = memo(function GradientDemoMixerImpl({
  colors = defaultPreset.params.colors,
  extraSides = defaultPreset.params.extraSides,
  shape = defaultPreset.params.shape,
  softness = defaultPreset.params.softness,
  test = defaultPreset.params.test,
  ...props
}: GradientDemoMixerProps) {
  const uniforms: GradientDemoMixerUniforms = {
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_extraSides: extraSides ?? defaultPreset.params.extraSides,
    u_shape: shape ?? defaultPreset.params.shape,
    u_softness: softness ?? defaultPreset.params.softness,
    u_test: test ?? defaultPreset.params.test,
  };

  return <ShaderMount {...props} fragmentShader={gradientDemoMixerFragmentShader} uniforms={uniforms} />;
});

const defaults = gradientDemoMixerPresets[0].params;

export default function Page() {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: gradientDemoMixerMaxColorCount,
  });

  const [params, setParams] = useControls(() => {
    const presets: GradientDemoMixerParams = Object.fromEntries(
      gradientDemoMixerPresets.map((preset) => {
        return [
          preset.name,
          button(() => {
            const { colors, ...presetParams } = preset.params;
            setParamsSafe(params, setParams, presetParams);
            setColors(colors);
          }),
        ];
      })
    );

    return {
      Parameters: folder(
        {
          shape: { value: defaults.shape, min: 0, max: 3, order: 5 },
          extraSides: { value: defaults.extraSides, order: 1 },
          test: { value: defaults.test, min: 0, max: 3, step: 1, order: 2 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 3 },
        },
        { order: 1 }
      ),
      Presets: folder(presets as Record<string, string>, { order: 2 }),
    };
  }, [colors.length]);

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(gradientDemoMixerPresets, params);
  cleanUpLevaParams(params);

  const getBlending = () => {
    if (params.test == 0) {
      return <>simple linear interpolation</>;
    } else if (params.test == 1) {
      return (
        <>
          smoothstep (use softness control)
          <br />
          https://thebookofshaders.com/glossary/?search=smoothstep
        </>
      );
    } else if (params.test == 2) {
      return (
        <>
          custom mixer (use softness control)
          <br />
          1. / (1. + exp(-1. / (pow(u_softness, 4.) + 1e-3) * (LINEAR_MIXER - .5)))
        </>
      );
    } else if (params.test == 3) {
      return (
        <>
          custom mixer (use softness control)
          <br />
          SMOOTH_MIXER = smoothstep(0., 1., LINEAR_MIXER);
          <br />
          RESULT = 1. / (1. + exp(-1. / (pow(u_softness, 4.) + 1e-3) * (SMOOTH_MIXER - .5)))
        </>
      );
    }
  };

  return (
    <ShaderContainer>
      <div className="relative flex h-full flex-col">
        <div className="absolute top-1/3 left-0 p-2 font-bold whitespace-pre text-white">{getBlending()}</div>
        <GradientDemoMixer {...params} colors={colors} className="h-full" />
      </div>
    </ShaderContainer>
  );
}
