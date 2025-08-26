'use client';

import { DotGrid, dotGridPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { DotGridShape, DotGridShapes } from '@paper-design/shaders';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderPageContent } from '@/components/shader-page-content';
import { dotGridDef } from '@/shader-defs/dot-grid-def';
import { Header } from '@/components/header';

/**
 * You can copy/paste this example to use DotGrid in your app
 */
const DotGridExample = () => {
  return <DotGrid style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = dotGridPresets[0].params;

const DotGridWithControls = () => {
  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFill: { value: toHsla(defaults.colorFill), order: 101 },
      colorStroke: { value: toHsla(defaults.colorStroke), order: 102 },
      size: { value: defaults.size, min: 1, max: 100, order: 200 },
      gapX: { value: defaults.gapX, min: 2, max: 500, order: 201 },
      gapY: { value: defaults.gapY, min: 2, max: 500, order: 202 },
      strokeWidth: { value: defaults.strokeWidth, min: 0, max: 50, order: 203 },
      sizeRange: { value: defaults.sizeRange, min: 0, max: 1, order: 204 },
      opacityRange: { value: defaults.opacityRange, min: 0, max: 1, order: 205 },
      shape: {
        value: defaults.shape,
        options: Object.keys(DotGridShapes) as DotGridShape[],
        order: 350,
      },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      dotGridPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(dotGridPresets, params);
  cleanUpLevaParams(params);

  return (
    <div className="page-container">
      <Header title={dotGridDef.name} />
      <DotGrid className="page-shader my-12" {...params} />
      <ShaderPageContent shaderDef={dotGridDef} currentParams={params} />
    </div>
  );
};

export default DotGridWithControls;
