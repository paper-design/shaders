'use client';

import { StaticLinearGradient, staticLinearGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { staticLinearGradientMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';

/**
 * You can copy/paste this example to use StaticLinearGradient in your app
 */
const StaticLinearGradientExample = () => {
  return <StaticLinearGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = staticLinearGradientPresets[0].params;

const StaticLinearGradientWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: staticLinearGradientMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          falloffTop: { value: defaults.falloffTop, min: 0, max: 4, order: 200 },
          falloffBottom: { value: defaults.falloffBottom, min: 0, max: 4, order: 201 },
          mixing: { value: defaults.mixing, min: 0, max: 1, order: 201 },
          repeatY: { value: defaults.repeatY, order: 201 },
          grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 300 },
          grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 301 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 400 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 402 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 403 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Fit: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 404 },
          worldWidth: { value: 1000, min: 0, max: 5120, order: 405 },
          worldHeight: { value: 500, min: 0, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      staticLinearGradientPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(staticLinearGradientPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <StaticLinearGradient {...params} colors={colors} className="fixed size-full" />
    </>
  );
};

export default StaticLinearGradientWithControls;
