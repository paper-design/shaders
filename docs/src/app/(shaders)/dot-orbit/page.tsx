'use client';

import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { dotOrbitMeta } from '@paper-design/shaders';
import { DotOrbit, dotOrbitPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderPageContent } from '@/components/shader-page-content';
import { dotOrbitDef } from '@/shader-defs/dot-orbit-def';
import { Header } from '@/components/header';

/**
 * You can copy/paste this example to use DotOrbit in your app
 */
const DotOrbitExample = () => {
  return <DotOrbit style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = dotOrbitPresets[0].params;

const DotOrbitWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: dotOrbitMeta.maxColorCount,
  });
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      dotOrbitPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );

    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      stepsPerColor: { value: defaults.stepsPerColor, min: 1, max: 4, step: 1, order: 200 },
      size: { value: defaults.size, min: 0, max: 1, order: 201 },
      sizeRange: { value: defaults.sizeRange, min: 0, max: 1, order: 202 },
      spreading: { value: defaults.spreading, min: 0, max: 1, order: 203 },
      scale: { value: defaults.scale, min: 0.01, max: 5, order: 300 },
      speed: { value: defaults.speed, min: 0, max: 20, order: 400 },
    };
  }, [colors.length]);
  useControls(() => {
    const presets = Object.fromEntries(
      dotOrbitPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(dotOrbitPresets, params);
  cleanUpLevaParams(params);

  return (
    <div className="page-container">
      <Header title={dotOrbitDef.name} />
      <DotOrbit className="my-12 aspect-16/9" {...params} colors={colors} />
      <ShaderPageContent shaderDef={dotOrbitDef} currentParams={{ ...params, colors }} />
    </div>
  );
};

export default DotOrbitWithControls;
