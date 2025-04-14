'use client';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { memo } from 'react';
import { getShaderColorFromString, type ShaderPreset } from '@paper-design/shaders';
import { ShaderMount, ShaderComponentProps } from '@paper-design/shaders-react';

type vec4 = [number, number, number, number];
const gradientDemoCSSMaxColorCount = 7;

type GradientDemoCSSUniforms = {
  u_colors: vec4[];
  u_colors_count: number;
  u_test: number;
};

type GradientDemoCSSParams = {
  colors?: string[];
  test?: number;
};

/**
 *
 * Uniforms include:
 * u_colors: An array of colors, each color is an array of 4 numbers [r, g, b, a]
 * u_colors_count: The number of colors in the u_colors array
 */

const gradientDemoCSSFragmentShader: string = `#version 300 es
precision highp float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_test;
uniform vec4 u_colors[${gradientDemoCSSMaxColorCount}];
uniform float u_colors_count;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

// magic numbers (and magic could be better tbh)
#define OKLCH_CHROMA_THRESHOLD .001
#define OKLCH_HUE_NEUTRALIZER -2.

vec3 srgbToLinear(vec3 srgb) {
    return pow(srgb, vec3(2.2));
}

vec3 linearToSrgb(vec3 linear) {
    return pow(linear, vec3(1.0/2.2));
}

vec3 LrgbToOklab(vec3 rgb) {
    float L = pow(0.4122214708 * rgb.r + 0.5363325363 * rgb.g + 0.0514459929 * rgb.b, 1.0 / 3.0);
    float M = pow(0.2119034982 * rgb.r + 0.6806995451 * rgb.g + 0.1073969566 * rgb.b, 1.0 / 3.0);
    float S = pow(0.0883024619 * rgb.r + 0.2817188376 * rgb.g + 0.6299787005 * rgb.b, 1.0 / 3.0);
    return vec3(
        0.2104542553 * L + 0.793617785 * M - 0.0040720468 * S,
        1.9779984951 * L - 2.428592205 * M + 0.4505937099 * S,
        0.0259040371 * L + 0.7827717662 * M - 0.808675766 * S
    );
}

vec3 OklabToLrgb(vec3 oklab) {
    float L = oklab.x;
    float a = oklab.y;
    float b = oklab.z;

    float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    float s_ = L - 0.0894841775 * a - 1.291485548 * b;

    float l = l_ * l_ * l_;
    float m = m_ * m_ * m_;
    float s = s_ * s_ * s_;

    return vec3(
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
    );
}

vec3 oklabToOklch(vec3 oklab) {
    float C = length(oklab.yz);
    float H = atan(oklab.z, oklab.y);
    if (C < OKLCH_CHROMA_THRESHOLD) {
      H = OKLCH_HUE_NEUTRALIZER;
    }
    return vec3(oklab.x, C, H);
}

vec3 oklchToOklab(vec3 oklch) {
    float a = oklch.y * cos(oklch.z);
    float b = oklch.y * sin(oklch.z);
    return vec3(oklch.x, a, b);
}

float mixHue(float h1, float h2, float mixer) {
    float delta = mod(h2 - h1 + PI, TWO_PI) - PI;
    return h1 + mixer * delta;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float mixer = uv.x * (u_colors_count - 1.);
    vec3 color = vec3(0.);

    if (u_test == 0.) {
        vec3 gradient = u_colors[0].rgb;
        for (int i = 1; i < ${gradientDemoCSSMaxColorCount}; i++) {
            if (i >= int(u_colors_count)) break;
            float localMixer = clamp(mixer - float(i - 1), 0., 1.);
            gradient = mix(gradient, u_colors[i].rgb, localMixer);
        }
        color = gradient;
    } else {
        vec3 gradient = oklabToOklch(LrgbToOklab(srgbToLinear(u_colors[0].rgb)));
        for (int i = 1; i < ${gradientDemoCSSMaxColorCount}; i++) {
            if (i >= int(u_colors_count)) break;
            float localMixer = clamp(mixer - float(i - 1), 0., 1.);
            vec3 c = oklabToOklch(LrgbToOklab(srgbToLinear(u_colors[i].rgb)));
            gradient.x = mix(gradient.x, c.x, localMixer);
            gradient.y = mix(gradient.y, c.y, localMixer);
            if (gradient.y > OKLCH_CHROMA_THRESHOLD && c.y > OKLCH_CHROMA_THRESHOLD) {
                gradient.z = mixHue(gradient.z, c.z, localMixer);
            }
        }
        color = linearToSrgb(OklabToLrgb(oklchToOklab(gradient)));
    }

    fragColor = vec4(color, 1.);
}
`;

interface GradientDemoCSSProps extends ShaderComponentProps, GradientDemoCSSParams {}
type GradientDemoCSSPreset = ShaderPreset<GradientDemoCSSParams>;

const defaultPreset: GradientDemoCSSPreset = {
  name: 'Default',
  params: {
    test: 1,
    colors: [
      'hsla(0, 100%, 50%, 1)',
      'hsla(240, 100%, 50%, 1)',
      'hsla(72, 76%, 20%, 1)',
      'hsla(259, 29%, 73%, 1)',
      'hsla(263, 57%, 39%, 1)',
      'hsla(48, 73%, 84%, 1)',
      'hsla(295, 32%, 70%, 1)',
    ],
  },
};

const beachPreset: GradientDemoCSSPreset = {
  name: 'Beach',
  params: {
    test: 1,
    colors: ['#999999', '#0000ff'],
  },
};

const fadedPreset: GradientDemoCSSPreset = {
  name: 'Faded',
  params: {
    test: 0,
    colors: ['hsla(186, 41%, 90%, 1)', 'hsla(208, 71%, 85%, 1)', 'hsla(183, 51%, 92%, 1)', 'hsla(201, 72%, 90%, 1)'],
  },
};

const gradientDemoCSSPresets: GradientDemoCSSPreset[] = [beachPreset, defaultPreset, fadedPreset];

const GradientDemoCSS: React.FC<GradientDemoCSSProps> = memo(function GradientDemoCSSImpl({
  colors = defaultPreset.params.colors,
  test = defaultPreset.params.test,
  ...props
}: GradientDemoCSSProps) {
  const uniforms: GradientDemoCSSUniforms = {
    u_colors: colors.map(getShaderColorFromString),
    u_colors_count: colors.length,
    u_test: test ?? defaultPreset.params.test,
  };

  return <ShaderMount {...props} fragmentShader={gradientDemoCSSFragmentShader} uniforms={uniforms} />;
});

const defaults = gradientDemoCSSPresets[0].params;

export default function Page() {
  const [{ colorCount }, setColorCount] = useControls(() => ({
    Colors: folder({
      colorCount: {
        value: defaults.colors.length,
        min: 2,
        max: gradientDemoCSSMaxColorCount,
        step: 1,
      },
    }),
  }));

  const [levaColors, setLevaColors] = useControls(() => {
    const colors: Record<string, { value: string }> = {};

    for (let i = 0; i < colorCount; i++) {
      colors[`color${i}`] = {
        value: defaults.colors[i] ?? 'hsla(' + Math.random() * 360 + ', 50%, 50%, 1)',
      };
    }

    return {
      Colors: folder(colors),
    };
  }, [colorCount]);

  const [params, setParams] = useControls(() => {
    const presets: GradientDemoCSSParams = Object.fromEntries(
      gradientDemoCSSPresets.map((preset) => {
        return [
          preset.name,
          button(() => {
            const { colors, ...presetParams } = preset.params;
            setParamsSafe(params, setParams, presetParams);
            setColorCount({ colorCount: colors.length });

            const presetColors = Object.fromEntries(
              colors.map((color, index) => {
                return [`color${index}`, color];
              })
            );

            setColorCount({ colorCount: colors.length });
            setParamsSafe(levaColors, setLevaColors, presetColors);
          }),
        ];
      })
    );

    return {
      Parameters: folder(
        {
          test: { value: defaults.test, min: 0, max: 1, step: 1, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets as Record<string, string>, { order: 2 }),
    };
  }, [colorCount]);

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(gradientDemoCSSPresets, params);
  cleanUpLevaParams(params);

  const colors = Object.values(levaColors) as unknown as string[];

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <div className="fixed flex size-full flex-col" style={{ width: 'calc(100% - 300px)' }}>
        <div className="relative h-1/3">
          <span className="absolute left-0 top-0 p-2 font-bold text-white">
            {`CSS: linear-gradient(to right in oklch, ${colors.join(', ')})`}
          </span>
          <div
            className="h-full"
            style={{
              background: `linear-gradient(to right in oklch, ${colors.join(', ')})`,
            }}
          />
        </div>

        <div className="relative h-1/3 w-full">
          <div className="top-half absolute left-0 whitespace-pre p-2 font-bold text-white">Shader</div>
          <GradientDemoCSS {...params} colors={colors} className="h-full w-full" />
        </div>

        <div className="relative h-1/3">
          <span className="absolute left-0 top-0 p-2 font-bold text-white">{`CSS: linear-gradient(to right, ${colors.join(', ')})`}</span>
          <div
            className="h-full"
            style={{
              background: `linear-gradient(to right, ${colors.join(', ')})`,
            }}
          />
        </div>
      </div>
    </>
  );
}
