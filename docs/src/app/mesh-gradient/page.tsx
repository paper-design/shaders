'use client';

import { MeshGradient, type MeshGradientParams, meshGradientPresets, meshGradientMaxColorCount } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use MeshGradient in your app
 */
const MeshGradientExample = () => {
  return (
    <MeshGradient
      colors={['#b3a6ce', '#562b9c', '#f4e8b8', '#c79acb']}
      speed={0.15}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = meshGradientPresets[0].params;

const MeshGradientWithControls = () => {
  const [{ colorCount }, setColorCount] = useControls(() => ({
    Colors: folder({
      colorCount: {
        value: defaults.colors.length,
        min: 1,
        max: meshGradientMaxColorCount,
        step: 1,
      },
    }),
  }));

  const [levaColors, setLevaColors] = useControls(() => {
    const colors: Record<string, { value: string }> = {};

    for (let i = 0; i < colorCount; i++) {
      colors[`color${i}`] = {
        value: defaults.colors[i] ?? 'hsla(0, 0%, 100%, 1)',
      };
    }

    return {
      Colors: folder(colors),
    };
  }, [colorCount]);

  const [params, setParams] = useControls(() => {
    const presets: MeshGradientParams = Object.fromEntries(
      meshGradientPresets.map((preset) => {
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
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets as Record<string, string>, { order: 2 }),
    };
  }, [colorCount]);

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(meshGradientPresets, params);
  cleanUpLevaParams(params);

  const colors = Object.values(levaColors) as unknown as string[];

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <MeshGradient {...params} colors={colors} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default MeshGradientWithControls;
