'use client';

import { SmokeRing, smokeRingPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { DEFAULT_MAX_PIXEL_COUNT, smokeRingMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';

/**
 * You can copy/paste this example to use SmokeRing in your app
 */
const SmokeRingExample = () => {
  return <SmokeRing style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = smokeRingPresets[0].params;

const SmokeRingWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: smokeRingMeta.maxColorCount,
  });

  const [{ logMaxPixelCount, ...params }, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          colorBack: { value: toHsla(defaults.colorBack), order: 100 },
          noiseScale: { value: defaults.noiseScale, min: 0.01, max: 5, order: 300 },
          noiseIterations: {
            value: defaults.noiseIterations,
            min: 1,
            max: smokeRingMeta.maxNoiseIterations,
            step: 1,
            order: 301,
          },
          radius: { value: defaults.radius, min: 0, max: 1, order: 302 },
          thickness: { value: defaults.thickness, min: 0.01, max: 1, order: 303 },
          innerShape: { value: defaults.innerShape, min: 0, max: 4, order: 304 },
          speed: { value: defaults.speed, min: 0, max: 4, order: 400 },
          // reverse: { value: defaults.reverse, order: 401 },
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
          collapsed: true,
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
      Resolution: folder(
        {
          logMaxPixelCount: {
            value: Math.log(DEFAULT_MAX_PIXEL_COUNT),
            min: 0,
            max: Math.log(DEFAULT_MAX_PIXEL_COUNT),
            order: 409,
          },
        },
        { order: 4, collapsed: true }
      ),
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      smokeRingPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  // shaders when navigating (if two shaders have a colorInner param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(smokeRingPresets, params);
  cleanUpLevaParams(params);

  // const { reverse, ...shaderParams } = { ...params, speed: params.speed * (params.reverse ? -1 : 1) };

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <SmokeRing {...params} colors={colors} className="fixed size-full" maxPixelCount={Math.exp(logMaxPixelCount)} />
    </>
  );
};

export default SmokeRingWithControls;
