'use client';

import { ColorPanels, type ColorPanelsParams, colorPanelsPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { colorPanelsMeta, ShaderFit, ShaderFitOptions, meshGradientMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';

/**
 * You can copy/paste this example to use ColorPanels in your app
 */
const ColorPanelsExample = () => {
  return <ColorPanels style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = colorPanelsPresets[0].params;

const ColorPanelsWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: colorPanelsMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          density: { value: defaults.density, min: 0.1, max: 3, order: 200 },
          angle1: { value: defaults.angle1, min: -1, max: 1, order: 202 },
          angle2: { value: defaults.angle2, min: -1, max: 1, order: 202 },
          length: { value: defaults.length, min: 0, max: 3, order: 203 },
          blur: { value: defaults.blur, min: 0, max: 0.5, order: 301 },
          fade: { value: defaults.fade, min: 0, max: 1, order: 302 },
          fadePosition: { value: defaults.fadePosition, min: 0, max: 1, order: 303 },
          gradient: { value: defaults.gradient, min: 0, max: 1, order: 304 },
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
          worldWidth: { value: 1000, min: 1, max: 5120, order: 405 },
          worldHeight: { value: 500, min: 1, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      colorPanelsPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  usePresetHighlight(colorPanelsPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <ColorPanels {...params} colors={colors} className="fixed size-full" />
    </>
  );
};

export default ColorPanelsWithControls;
