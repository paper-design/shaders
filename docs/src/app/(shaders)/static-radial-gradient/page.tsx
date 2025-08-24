'use client';

import { StaticRadialGradient, staticRadialGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { staticRadialGradientMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * You can copy/paste this example to use StaticRadialGradient in your app
 */
const StaticRadialGradientExample = () => {
  return <StaticRadialGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = staticRadialGradientPresets[0].params;

const StaticRadialGradientWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: staticRadialGradientMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      radius: { value: defaults.radius, min: 0, max: 3, order: 200 },
      focalDistance: { value: defaults.focalDistance, min: 0, max: 3, order: 201 },
      focalAngle: { value: defaults.focalAngle, min: 0, max: 360, order: 202 },
      falloff: { value: defaults.falloff, min: -1, max: 1, order: 201 },
      mixing: { value: defaults.mixing, min: 0, max: 1, order: 204 },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 205 },
      distortionShift: { value: defaults.distortionShift, min: -1, max: 1, order: 206 },
      distortionFreq: { value: defaults.distortionFreq, min: 0, max: 20, step: 1, order: 207 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 208 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 209 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 300 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      staticRadialGradientPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(staticRadialGradientPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <StaticRadialGradient {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails
        name="Static Radial Gradient"
        currentParams={{ ...params, colors }}
        description="N-colors radial gradient."
        props={{
          'colorBack': 'Background color.',
          'colors': 'Colors used for the effect.',
          'radius': 'Circle radius.',
          'focalDistance, focalAngle': 'Gradient center offset to the circle center.',
          'falloff': 'Color points distribution (0 for linear gradient).',
          'mixing': '0 for stepped gradient, 0.5 for smooth transitions, 1 for pronounced color points.',
          'distortion, distortionShift, distortionFreq': 'Radial distortion (effective with distortion > 0).',
          'grainMixer': 'Shape distortion.',
          'grainOverlay': 'Post-processing blending.',
          'offsetX, offsetY': 'Position of the center.',
          'scale': 'Overall pattern zoom.',
          'rotation': 'Overall pattern rotation angle.',
        }}
      />
    </>
  );
};

export default StaticRadialGradientWithControls;
