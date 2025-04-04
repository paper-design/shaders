'use client';

import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { GodRays, godRaysPresets } from '@paper-design/shaders-react';
import { ShaderFitOptions, ShaderFit } from '@paper-design/shaders';
import { useControls, button, folder } from 'leva';
import Link from 'next/link';

/**
 * You can copy/paste this example to use GodRays in your app
 */
const GodRaysExample = () => {
  return (
    <GodRays
      colorBack="#404040"
      color1="#6669ff"
      color2="#66ffb3"
      color3="#66ccff"
      offsetX={0}
      offsetY={0}
      spotty={0.15}
      midIntensity={0}
      midSize={0}
      density={0.8}
      blending={0.4}
      frequency={1.2}
      speed={2}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = godRaysPresets[0].params;

const GodRaysWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      godRaysPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: defaults.colorBack, order: 100 },
          color1: { value: defaults.color1, order: 101 },
          color2: { value: defaults.color2, order: 102 },
          color3: { value: defaults.color2, order: 103 },
          frequency: { value: defaults.frequency, min: 0, max: 30, order: 303 },
          spotty: { value: defaults.spotty, min: 0, max: 1, order: 304 },
          midSize: { value: defaults.midSize, min: 0, max: 5, order: 305 },
          midIntensity: { value: defaults.midIntensity, min: 0, max: 1, order: 306 },
          density: { value: defaults.density, min: 0, max: 1, order: 307 },
          blending: { value: defaults.blending, min: 0, max: 1, order: 308 },
          speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
        },
        { order: 1 }
      ),
      Size: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 400 },
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 401 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 402 },
          worldWidth: { value: 1000, min: 1, max: 5120, order: 406 },
          worldHeight: { value: 500, min: 1, max: 5120, order: 407 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Position: folder(
        {
          originX: { value: defaults.originX, min: 0, max: 1, order: 402 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 403 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 404 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 405 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(godRaysPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <GodRays className="fixed size-full" {...params} />
    </>
  );
};

export default GodRaysWithControls;
