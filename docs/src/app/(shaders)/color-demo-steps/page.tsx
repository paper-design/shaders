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
const gradientDemoStepsMaxColorCount = 10;

type GradientDemoStepsUniforms = {
  u_colors: vec4[];
  u_colorsCount: number;
  u_shape: number;
  u_extraSides: boolean;
  u_extraSteps: number;
  u_softness: number;
};

type GradientDemoStepsParams = {
  colors?: string[];
  shape?: number;
  extraSides?: boolean;
  extraSteps?: number;
  softness?: number;
};

const gradientDemoStepsFragmentShader: string = `#version 300 es
precision mediump float;

uniform float u_pixelRatio;
uniform vec2 u_resolution;
uniform float u_time;

uniform float u_shape;
uniform vec4 u_colors[${gradientDemoStepsMaxColorCount}];
uniform float u_colorsCount;
uniform bool u_extraSides;
uniform float u_extraSteps;
uniform float u_softness;

out vec4 fragColor;


float steppedSmooth(float t, float steps, float softness) {
    float stepT = floor(t * steps) / steps;
    float f = t * steps - floor(t * steps);

    float fw = 0.;
    float smoothed = smoothstep(.5 - softness * .5 - fw, .5 + softness * .5 + fw, f);

    return stepT + smoothed / steps;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ratio = u_resolution.x / u_resolution.y;

  float shape = pow(uv.x, u_shape);

  float mixer = shape * (u_colorsCount - 1.);
  if (u_extraSides == true) {
    mixer = (shape - .5 / u_colorsCount) * u_colorsCount;
  }

  float steps = max(1., u_extraSteps + 1.);

  vec3 gradient = u_colors[0].rgb;
  for (int i = 1; i < ${gradientDemoStepsMaxColorCount}; i++) {
      if (i >= int(u_colorsCount)) break;
      float localT = clamp(mixer - float(i - 1), 0.0, 1.0);
      // localT = round(localT * steps) / steps;
      localT = steppedSmooth(localT, steps, u_softness);
      gradient = mix(gradient, u_colors[i].rgb, localT);
  }

  if (u_extraSides == true) {
   if ((mixer < 0.) || (mixer > (u_colorsCount - 1.))) {
     float localT = mixer + 1.;
     if (mixer > (u_colorsCount - 1.)) {
       localT = mixer - (u_colorsCount - 1.);
     }
     // localT = round(localT * steps) / steps;
     localT = steppedSmooth(localT, steps, u_softness);
     gradient = mix(u_colors[int(u_colorsCount - 1.)].rgb, u_colors[0].rgb, localT);
   }
  }

  vec3 color = vec3(shape);
  if (uv.y < .5) {
   color = gradient;
  }

  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);

  fragColor = vec4(color, 1.);
}
`;

interface GradientDemoStepsProps extends ShaderComponentProps, GradientDemoStepsParams {}
type GradientDemoStepsPreset = ShaderPreset<GradientDemoStepsParams>;

const defaultPreset: GradientDemoStepsPreset = {
  name: 'Default',
  params: {
    shape: 1,
    extraSides: true,
    extraSteps: 0,
    softness: 0,
    colors: ['hsla(259, 100%, 50%, 1)', 'hsla(150, 100%, 50%, 1)', 'hsla(48, 100%, 50%, 1)', 'hsla(295, 100%, 50%, 1)'],
  },
};

const gradientDemoStepsPresets: GradientDemoStepsPreset[] = [defaultPreset];

const GradientDemoSteps: React.FC<GradientDemoStepsProps> = memo(function GradientDemoStepsImpl({
  colors = defaultPreset.params.colors,
  extraSides = defaultPreset.params.extraSides,
  shape = defaultPreset.params.shape,
  extraSteps = defaultPreset.params.extraSteps,
  softness = defaultPreset.params.softness,
  ...props
}: GradientDemoStepsProps) {
  const uniforms: GradientDemoStepsUniforms = {
    u_colors: colors.map(getShaderColorFromString),
    u_colorsCount: colors.length,
    u_extraSides: extraSides ?? defaultPreset.params.extraSides,
    u_shape: shape ?? defaultPreset.params.shape,
    u_extraSteps: extraSteps ?? defaultPreset.params.extraSteps,
    u_softness: softness ?? defaultPreset.params.softness,
  };

  return <ShaderMount {...props} fragmentShader={gradientDemoStepsFragmentShader} uniforms={uniforms} />;
});

const defaults = gradientDemoStepsPresets[0].params;

export default function Page() {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: gradientDemoStepsMaxColorCount,
  });

  const [params, setParams] = useControls(() => {
    const presets: GradientDemoStepsParams = Object.fromEntries(
      gradientDemoStepsPresets.map((preset) => {
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
          extraSteps: { value: defaults.extraSteps, min: 0, max: 10, step: 1, order: 2 },
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
  usePresetHighlight(gradientDemoStepsPresets, params);
  cleanUpLevaParams(params);

  return (
    <ShaderContainer>
      <GradientDemoSteps {...params} colors={colors} />
    </ShaderContainer>
  );
}
