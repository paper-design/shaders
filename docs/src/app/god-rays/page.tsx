'use client';

import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { GodRays, godRaysPresets } from '@paper-design/shaders-react';
import { ShaderFitOptions, ShaderFit, metaballsMeta, godRaysMeta } from '@paper-design/shaders';
import { useControls, button, folder } from 'leva';
import Link from 'next/link';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from "@/helpers/to-hsla";

/**
 * You can copy/paste this example to use GodRays in your app
 */
const GodRaysExample = () => {
  return <GodRays style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = godRaysPresets[0].params;

const GodRaysWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: godRaysMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          colorBack: { value: toHsla(defaults.colorBack), order: 100 },
          frequency: { value: defaults.frequency, min: 0, max: 30, order: 303 },
          spotty: { value: defaults.spotty, min: 0, max: 1, order: 304 },
          midSize: { value: defaults.midSize, min: 0, max: 8, order: 305 },
          midIntensity: { value: defaults.midIntensity, min: 0, max: 1, order: 306 },
          density: { value: defaults.density, min: 0, max: 1, order: 307 },
          blending: { value: defaults.blending, min: 0, max: 1, order: 308 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
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
  });

  useControls(() => {
    const presets = Object.fromEntries(
      godRaysPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  usePresetHighlight(godRaysPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <GodRays {...params} colors={colors} className="fixed size-full" />
    </>
  );
};

export default GodRaysWithControls;
