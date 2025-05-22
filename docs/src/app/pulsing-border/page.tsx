'use client';

import { PulsingBorder, pulsingBorderPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { pulsingBorderMeta, ShaderFit, ShaderFitOptions, simplexNoiseMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';

/**
 * You can copy/paste this example to use PulsingBorder in your app
 */
const PulsingBorderExample = () => {
  return <PulsingBorder style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = pulsingBorderPresets[0].params;

const PulsingBorderWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: pulsingBorderMeta.maxColorCount,
  });
  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          roundness: { value: defaults.roundness, min: 0, max: 1, order: 300 },
          thickness: { value: defaults.thickness, min: 0, max: 0.2, order: 301 },
          softness: { value: defaults.softness, min: 0, max: 1, order: 302 },
          intensity: { value: defaults.intensity, min: 0, max: 4, order: 303 },
          spotsPerColor: {
            value: defaults.spotsPerColor,
            min: 1,
            max: pulsingBorderMeta.maxSpotsPerColor,
            step: 1,
            order: 304,
          },
          spotSize: { value: defaults.spotSize, min: 0.1, max: 0.35, order: 305 },
          pulse: { value: defaults.pulse, min: 0, max: 1, order: 306 },
          smoke: { value: defaults.smoke, min: 0, max: 1, order: 307 },
          smokeSize: { value: defaults.smokeSize, min: 0, max: 2, order: 308 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.01, max: 1, order: 400 },
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
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      pulsingBorderPresets.map(({ name, params: preset }) => [
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
  usePresetHighlight(pulsingBorderPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <PulsingBorder {...params} colors={colors} className="fixed size-full" />
    </>
  );
};

export default PulsingBorderWithControls;
