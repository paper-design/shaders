'use client';

import { TttttBorder, type TttttBorderParams, tttttBorderPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use TttttBorder in your app
 */
const TttttBorderExample = () => {
  return <TttttBorder style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = tttttBorderPresets[0].params;

const TttttBorderWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: TttttBorderParams = Object.fromEntries(
      tttttBorderPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          color1: { value: defaults.color1, order: 101 },
          color2: { value: defaults.color2, order: 102 },
          color3: { value: defaults.color3, order: 103 },
          size: { value: defaults.size, min: 0, max: 500, order: 200 },
          blur: { value: defaults.blur, min: 0, max: .5, order: 206 },
          grainDistortion: { value: defaults.grainDistortion, min: 0, max: 1, order: 206 },
          grainAddon: { value: defaults.grainAddon, min: 0, max: 1, order: 206 },
            offsetX: {value: defaults.offsetX, min: -.5, max: .5, order: 301},
            offsetY: {value: defaults.offsetY, min: -.5, max: .5, order: 302},
            scaleX: {value: defaults.scaleX, min: -.2, max: .2, order: 302},
            scaleY: {value: defaults.scaleY, min: -1.5, max: 1.5, order: 303},
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(tttttBorderPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <TttttBorder {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default TttttBorderWithControls;
