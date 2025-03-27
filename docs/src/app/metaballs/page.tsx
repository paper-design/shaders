'use client';

import { Metaballs, type MetaballsParams, metaballsPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';

/**
 * You can copy/paste this example to use Metaballs in your app
 */
const MetaballsExample = () => {
  return (
    <Metaballs
      color1="#f42547"
      color2="#eb4763"
      color3="#f49d71"
      scale={1}
      ballSize={1}
      visibilityRange={0.4}
      speed={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = { ...metaballsPresets[0].params, style: { background: 'hsla(0, 0%, 0%, 0)' } };

const MetaballsWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          color1: { value: defaults.color1, order: 100 },
          color2: { value: defaults.color2, order: 101 },
          color3: { value: defaults.color3, order: 102 },
          scale: { value: defaults.scale, min: 0, max: 2, order: 200 },
          ballSize: { value: defaults.ballSize, min: 0, max: 1, order: 300 },
          visibilityRange: { value: defaults.visibilityRange, min: 0.05, max: 1, order: 301 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
        },
        { order: 1 }
      ),
    };
  });

  useControls(() => {
    const presets: MetaballsParams = Object.fromEntries(
      metaballsPresets.map((preset) => [
        preset.name,
        button(() => {
          setParamsSafe(params, setParams, preset.params);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(metaballsPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Metaballs className="fixed size-full" {...params} />
    </>
  );
};

export default MetaballsWithControls;
