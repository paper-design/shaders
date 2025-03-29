'use client';

import {
  GradientDemoMixer,
  type GradientDemoMixerParams,
  gradientDemoMixerPresets,
  gradientDemoMixerMaxColorCount, GradientDemoCSS,
} from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use GradientDemoMixer in your app
 */
const GradientDemoMixerExample = () => {
  return (
    <GradientDemoMixer
      colors={['#b3a6ce', '#562b9c', '#f4e8b8', '#c79acb']}
      speed={0.15}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = gradientDemoMixerPresets[0].params;

const GradientDemoMixerWithControls = () => {
  const [{ colorCount }, setColorCount] = useControls(() => ({
    Colors: folder({
      colorCount: {
        value: defaults.colors.length,
        min: 2,
        max: gradientDemoMixerMaxColorCount,
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
    const presets: GradientDemoMixerParams = Object.fromEntries(
      gradientDemoMixerPresets.map((preset) => {
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
          shape: { value: defaults.shape, min: 0, max: 3, order: 0 },
            extraSides: {value: defaults.extraSides, order: 1},
            test: { value: defaults.test, min: 0, max: 3, step: 1, order: 2 },
            softness: {value: defaults.softness, min: 0, max: 1, order: 3},
            bNoise: {value: defaults.bNoise, min: 0, max: 100, order: 4},
        },
        { order: 1 }
      ),
      Presets: folder(presets as Record<string, string>, { order: 2 }),
    };
  }, [colorCount]);

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(gradientDemoMixerPresets, params);
  cleanUpLevaParams(params);

  const colors = Object.values(levaColors) as unknown as string[];

  const getBlending = () => {
    if (params.test == 0) {
      return (
          <>
            simple linear interpolation
          </>
      );
    } else if (params.test == 1) {
      return (
          <>
            smoothstep (use softness control)
            <br/>
            https://thebookofshaders.com/glossary/?search=smoothstep
          </>
      );
    } else if (params.test == 2) {
      return (
          <>
            custom mixer (use softness control)
            <br/>
            1. / (1. + exp(-1. / (pow(u_softness, 4.) + 1e-3) * (LINEAR_MIXER - .5)))
          </>
      );
    } else if (params.test == 3) {
      return (
          <>
            custom mixer (use softness control)
            <br/>
            SMOOTH_MIXER = smoothstep(0., 1., LINEAR_MIXER);
            <br/>
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
      <div className="relative flex size-full flex-col h-screen" style={{ width: 'calc(100% - 300px)' }}>
        <div className="absolute left-0 top-1/3 whitespace-pre p-2 font-bold text-white">
          {getBlending()}
        </div>
        <GradientDemoMixer {...params} colors={colors} className="h-full" />
      </div>
    </>
  );
};

export default GradientDemoMixerWithControls;
