'use client';

import { BorderPattern, type BorderPatternParams, borderPatternPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use BorderPattern in your app
 */
const BorderPatternExample = () => {
  return <BorderPattern style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = borderPatternPresets[0].params;

const BorderPatternWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets: BorderPatternParams = Object.fromEntries(
      borderPatternPresets.map((preset) => [preset.name, button(() => setParamsSafe(params, setParams, preset.params))])
    );

    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          color: { value: defaults.color, order: 101 },
          pxSize: { value: defaults.pxSize, min: 0, max: 400, order: 200 },
          scale: { value: defaults.scale, min: 0, max: 3, order: 205 },
          sizeRandomised: { value: defaults.sizeRandomised, min: 0, max: 1, order: 205 },
        },
        { order: 1 }
      ),
      Presets: folder(presets, { order: 2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);

  usePresetHighlight(borderPatternPresets, params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <BorderPattern {...params} style={{ position: 'fixed', width: '100%', height: '100%' }} />
    </>
  );
};

export default BorderPatternWithControls;
