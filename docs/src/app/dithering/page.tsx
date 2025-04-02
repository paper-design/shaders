'use client';

import {Dithering, type DitheringParams, ditheringPresets, dotGridPresets} from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import {cleanUpLevaParams} from "@/helpers/clean-up-leva-params";

/**
 * You can copy/paste this example to use Dithering in your app
 */
const DitheringExample = () => {
  return <Dithering style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = { ...ditheringPresets[0].params, style: { background: 'hsla(0, 0%, 0%, 0)' } };

const DitheringWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          shape: { value: defaults.shape, min: 1, max: 7, step: 1, order: 200 },
          scale: { value: defaults.scale, min: 0.1, max: 3, order: 201 },
          type: { value: defaults.type, min: 1, max: 4, step: 1, order: 250 },
          pxRounded: { value: defaults.pxRounded, order: 251 },
          pxSize: { value: defaults.pxSize, min: 2, max: 30, order: 252 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
        },
        { order: 1 }
      ),
    };
  });

  useControls(() => {
    const presets: DitheringParams = Object.fromEntries(
        ditheringPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );
    return {
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(ditheringPresets, params);
  cleanUpLevaParams(params);
  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Dithering className="fixed size-full" {...params} />
    </>
  );
};

export default DitheringWithControls;
