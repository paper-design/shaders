'use client';

import { GrainAndNoise, grainAndNoisePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { toHsla } from '@/helpers/to-hsla';

/**
 * You can copy/paste this example to use GrainAndNoise in your app
 */
const GrainAndNoiseExample = () => {
  return <GrainAndNoise style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = grainAndNoisePresets[0].params;

const GrainAndNoiseWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      grainAndNoisePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Parameters: folder(
        {
          colorFront: { value: toHsla(defaults.colorFront), order: 100 },
          colorBack: { value: toHsla(defaults.colorBack), order: 101 },
          contrast: { value: defaults.contrast, min: 0, max: 1, order: 200 },

          grain: { value: defaults.grain, min: 0, max: 1, order: 300 },

          curles: { value: defaults.curles, min: 0, max: 1, order: 310 },
          curlesScale: { value: defaults.curlesScale, min: 0, max: 1, order: 310 },

          crumples: { value: defaults.crumples, min: 0, max: 1, order: 320 },
          crumplesSeed: { value: defaults.crumplesSeed, min: 0, max: 1000, order: 321 },
          crumplesScale: { value: defaults.crumplesScale, min: 0.3, max: 3, order: 322 },

          folds: { value: defaults.folds, min: 0, max: 1, order: 330 },
          foldsNumber: { value: defaults.foldsNumber, min: 1, max: 15, step: 1, order: 331 },
          foldsSeed: { value: defaults.foldsSeed, min: 0, max: 1000, order: 332 },

          blur: { value: defaults.blur, min: 0, max: 1, order: 340 },
          blurSeed: { value: defaults.blurSeed, min: 0, max: 10, order: 341 },

          drops: { value: defaults.drops, min: 0, max: 1, order: 350 },
          dropsSeed: { value: defaults.dropsSeed, min: 0, max: 10, order: 351 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.5, max: 2, order: 400 },
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
          worldWidth: { value: 0, min: 0, max: 5120, order: 405 },
          worldHeight: { value: 0, min: 0, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(grainAndNoisePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <GrainAndNoise {...params} className="fixed size-full" />
    </>
  );
};

export default GrainAndNoiseWithControls;
