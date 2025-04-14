'use client';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

import { memo } from 'react';
import { ShaderMount, type ShaderComponentProps } from '@paper-design/shaders-react';
import { getShaderColorFromString, type ShaderPreset } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';

type vec4 = [number, number, number, number];
const gradientDemoMixerMaxColorCount = 7;

type GradientDemoMixerUniforms = {
  u_colors: vec4[];
  u_colors_count: number;
  u_shape: number;
  u_softness: number;
  u_bNoise: number;
  u_test: number;
  u_extraSides: boolean;
};

type GradientDemoMixerParams = {
  colors?: string[];
  shape?: number;
  softness?: number;
  bNoise?: number;
  test?: number;
  extraSides?: boolean;
};

/**
 *
 * Uniforms include:
 * u_colors: An array of colors, each color is an array of 4 numbers [r, g, b, a]
 * u_colors_count: The number of colors in the u_colors array
 */

const gradientDemoMixerFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_shape;
uniform float u_softness;
uniform float u_bNoise;
uniform vec4 u_colors[${gradientDemoMixerMaxColorCount}];
uniform float u_colors_count;
uniform bool u_extraSides;
uniform float u_test;

out vec4 fragColor;


float random(vec2 seed) {
    return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
}

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float get_noise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}


void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  float noise = (sin(gl_FragCoord.x * 1.2 + sin(gl_FragCoord.y * 1.2)) * .5 + .5);

  float shape = pow(uv.x, u_shape);
//  float shape = pow(.5 + .5 * get_noise(uv, .4 * u_time), u_shape);


  float mixer = shape * (u_colors_count - 1.);
  if (u_extraSides == true) {
    mixer = (shape - .5 / u_colors_count) * u_colors_count;
  }

  vec3 gradient = u_colors[0].rgb;

  for (int i = 1; i < ${gradientDemoMixerMaxColorCount}; i++) {
      if (i >= int(u_colors_count)) break;
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
  if (uv.y < .66) {
   color = gradient;
  }

  color += 1. / 256. * u_bNoise * (random(.014 * gl_FragCoord.xy) - .5);

  fragColor = vec4(color, 1.);
}
`;

interface GradientDemoMixerProps extends ShaderComponentProps, GradientDemoMixerParams {}
type GradientDemoMixerPreset = ShaderPreset<GradientDemoMixerParams>;

const defaultPreset: GradientDemoMixerPreset = {
  name: 'Default',
  params: {
    shape: 1,
    softness: 0,
    bNoise: 1,
    test: 0,
    extraSides: true,
    colors: ['hsla(259, 29%, 73%, 1)', 'hsla(263, 57%, 39%, 1)', 'hsla(48, 73%, 84%, 1)', 'hsla(295, 32%, 70%, 1)'],
  },
};

const bandingPreset: GradientDemoMixerPreset = {
  name: 'banding',
  params: {
    shape: 0.67,
    softness: 1,
    bNoise: 0,
    test: 1,
    extraSides: true,
    colors: ['#332848', '#094008'],
  },
};

const gradientDemoMixerPresets: GradientDemoMixerPreset[] = [defaultPreset, bandingPreset];

const GradientDemoMixer: React.FC<GradientDemoMixerProps> = memo(function GradientDemoMixerImpl({
  bNoise = defaultPreset.params.bNoise,
  colors = defaultPreset.params.colors,
  extraSides = defaultPreset.params.extraSides,
  shape = defaultPreset.params.shape,
  softness = defaultPreset.params.softness,
  test = defaultPreset.params.test,
  ...props
}: GradientDemoMixerProps) {
  const uniforms: GradientDemoMixerUniforms = {
    u_colors: colors.map(getShaderColorFromString),
    u_colors_count: colors.length,
    u_bNoise: bNoise ?? defaultPreset.params.bNoise,
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
          bNoise: { value: defaults.bNoise, min: 0, max: 100, order: 4 },
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
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <div className="relative flex size-full h-screen flex-col" style={{ width: 'calc(100% - 300px)' }}>
        <div className="absolute left-0 top-1/3 whitespace-pre p-2 font-bold text-white">{getBlending()}</div>
        <GradientDemoMixer {...params} colors={colors} className="h-full" />
      </div>
    </>
  );
}
