'use client';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { memo } from 'react';
import { getShaderColorFromString, type ShaderPreset } from '@paper-design/shaders';
import { ShaderMount, ShaderComponentProps } from '@paper-design/shaders-react';
import { useColors } from '@/helpers/use-colors';
import { ShaderContainer } from '@/components/shader-container';

type vec4 = [number, number, number, number];
const gradientDemoCSSMaxColorCount = 7;

type GradientDemoCSSUniforms = {
  u_colors: vec4[];
  u_colorsCount: number;
  u_colorSpace: number;
};

type GradientDemoCSSParams = {
  colors?: string[];
  colorSpace?: number;
};

const gradientDemoCSSFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_colorSpace;
uniform vec4 u_colors[${gradientDemoCSSMaxColorCount}];
uniform float u_colorsCount;

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

vec3 srgbToOklab(vec3 rgb) {
    return oklabToOklch(LrgbToOklab(srgbToLinear(rgb)));
}

vec3 oklabToSrgb(vec3 oklab) {
    return linearToSrgb(OklabToLrgb(oklchToOklab(oklab)));
}

vec3 mixOklabVector(vec3 color1, vec3 color2, float mixer) {
  color1.x = mix(color1.x, color2.x, mixer);
  color1.y = mix(color1.y, color2.y, mixer);
  if (color1.y > OKLCH_CHROMA_THRESHOLD && color2.y > OKLCH_CHROMA_THRESHOLD) {
    color1.z = mixHue(color1.z, color2.z, mixer);
  }
  return color1;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float mixer = uv.x * (u_colorsCount - 1.);
    vec3 color = vec3(0.);

    vec3 gradient = u_colors[0].rgb;
    if (u_colorSpace == 1.) {
      gradient = srgbToOklab(u_colors[0].rgb);
    }

    for (int i = 1; i < ${gradientDemoCSSMaxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;
      float localMixer = clamp(mixer - float(i - 1), 0., 1.);
      vec3 c = u_colors[i].rgb;
      if (u_colorSpace == 0.) {
        gradient = mix(gradient, c, localMixer);
      } else {
        c = srgbToOklab(u_colors[i].rgb);
        gradient = mixOklabVector(gradient, c, localMixer);
      }
    }

    if (u_colorSpace == 0.) {
      color = gradient;
    } else {
      color = oklabToSrgb(gradient);
    }

    fragColor = vec4(color, 1.);
}
`;

interface GradientDemoCSSProps extends ShaderComponentProps, GradientDemoCSSParams {}
type GradientDemoCSSPreset = ShaderPreset<GradientDemoCSSParams>;

const defaultPreset: GradientDemoCSSPreset = {
  name: 'Default',
  params: {
    colorSpace: 1,
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

const gradientDemoCSSPresets: GradientDemoCSSPreset[] = [defaultPreset];

const GradientDemoCSS: React.FC<GradientDemoCSSProps> = memo(function GradientDemoCSSImpl({
  colors = defaultPreset.params.colors,
  colorSpace = defaultPreset.params.colorSpace,
  ...props
}: GradientDemoCSSProps) {
  const uniforms: GradientDemoCSSUniforms = {
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_colorSpace: colorSpace ?? defaultPreset.params.colorSpace,
  };

  return <ShaderMount {...props} fragmentShader={gradientDemoCSSFragmentShader} uniforms={uniforms} />;
});

const defaults = gradientDemoCSSPresets[0].params;

export default function Page() {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: gradientDemoCSSMaxColorCount,
  });

  const [params, setParams] = useControls(() => {
    const presets: GradientDemoCSSParams = Object.fromEntries(
      gradientDemoCSSPresets.map((preset) => {
        return [
          preset.name,
          button(() => {
            const { colors, ...presetParams } = preset.params;
            setColors(colors);
            setParamsSafe(params, setParams, presetParams);
          }),
        ];
      })
    );

    return {
      Parameters: folder(
        {
          colorSpace: { value: defaults.colorSpace, min: 0, max: 1, step: 1, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets as Record<string, string>, { order: 2 }),
    };
  }, [colors.length]);

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(gradientDemoCSSPresets, params);
  cleanUpLevaParams(params);

  return (
    <ShaderContainer>
      <div className="relative h-1/3 w-full text-center">
        <span className="absolute top-0 left-0 w-full p-2 font-bold text-white">{`CSS OKLCH`}</span>
        <div
          className="h-full"
          style={{
            background: `linear-gradient(to right in oklch, ${colors.join(', ')})`,
          }}
        />
      </div>

      <div className="relative h-1/3 w-full text-center">
        <span className="absolute top-0 left-0 z-10 w-full p-2 font-bold text-white">{`Shader`}</span>
        <GradientDemoCSS {...params} colors={colors} className="h-full w-full" />
      </div>

      <div className="relative h-1/3 w-full text-center">
        <span className="absolute top-0 left-0 w-full p-2 font-bold text-white">{`CSS Default`}</span>
        <div
          className="h-full"
          style={{
            background: `linear-gradient(to right, ${colors.join(', ')})`,
          }}
        />
      </div>
    </ShaderContainer>
  );
}
