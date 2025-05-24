'use client';

import { PaperTexture, type PaperTextureParams, paperTexturePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';

/**
 * You can copy/paste this example to use PaperTexture in your app
 */
const PaperTextureExample = () => {
  return <PaperTexture style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = paperTexturePresets[0].params;

const PaperTextureWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      paperTexturePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );

    return {
      Parameters: folder(
        {
          colorFront: { value: defaults.colorFront, order: 100 },
          colorBack: { value: defaults.colorBack, order: 101 },
          brightness: { value: defaults.brightness, min: 0, max: 10, order: 300 },
          height: { value: defaults.height, min: 0, max: 6, order: 300 },
          grain: { value: defaults.grain, min: 0, max: 2, order: 300 },
          curles: { value: defaults.curles, min: 0, max: 2, order: 300 },
          crumples: { value: defaults.crumples, min: 0, max: 2, order: 300 },
          foldsScale: { value: defaults.foldsScale, min: 0, max: 1, order: 300 },
          folds: { value: defaults.folds, min: 0, max: 2, order: 300 },
          blurScale: { value: defaults.blurScale, min: 0, max: 10, order: 300 },
          crumplesScale: { value: defaults.crumplesScale, min: 0.3, max: 5, order: 300 },
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
          collapsed: false,
        }
      ),
      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(paperTexturePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <PaperTexture className="fixed size-full" {...params} />
    </>
  );
};

export default PaperTextureWithControls;
