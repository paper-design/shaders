'use client';

import { Swirl, swirlPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { simplexNoiseMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderPageContent } from '@/components/shader-page-content';
import { swirlDef } from '@/shader-defs/swirl-def';
import { Header } from '@/components/header';

/**
 * You can copy/paste this example to use Swirl in your app
 */
const SwirlExample = () => {
  return <Swirl style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = swirlPresets[0].params;

const SwirlWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: simplexNoiseMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      bandCount: { value: defaults.bandCount, min: 0, max: 15, step: 1, order: 200 },
      twist: { value: defaults.twist, min: 0, max: 1, order: 201 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 202 },
      noiseFrequency: { value: defaults.speed, min: 0, max: 1, order: 203 },
      noise: { value: defaults.speed, min: 0, max: 1, order: 204 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      swirlPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a colorBack param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(swirlPresets, params);
  cleanUpLevaParams(params);

  return (
    <div className="page-container">
      <Header title={swirlDef.name} />
      <Swirl className="page-shader my-12" {...params} colors={colors} />
      <ShaderPageContent shaderDef={swirlDef} currentParams={{ ...params, colors }} />
    </div>
  );
};

export default SwirlWithControls;
