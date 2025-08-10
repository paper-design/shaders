'use client';

import { BlobsGrid, type BlobsGridParams, blobsGridPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions, blobsGridMeta } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';

/**
 * You can copy/paste this example to use BlobsGrid in your app
 */
const BlobsGridExample = () => {
  return <BlobsGrid style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = blobsGridPresets[0].params;

const BlobsGridWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: blobsGridMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          stepsPerColor: { value: defaults.stepsPerColor, min: 1, max: 3, step: 1, order: 0 },
          colorBack: { value: toHsla(defaults.colorBack), order: 100 },
          colorShade: { value: toHsla(defaults.colorShade), order: 101 },
          colorSpecular: { value: toHsla(defaults.colorSpecular), order: 101 },
          colorInnerShadow: { value: toHsla(defaults.colorInnerShadow), order: 102 },
          distortion: { value: defaults.distortion, min: 0, max: 20, order: 300 },
          size: { value: defaults.size, min: 0, max: 1, order: 301 },
          specular: { value: defaults.specular, min: 0, max: 1, order: 302 },
          specularNormal: { value: defaults.specularNormal, min: 0, max: 1, order: 303 },
          shade: { value: defaults.shade, min: 0, max: 1, order: 304 },
          innerShadow: { value: defaults.innerShadow, min: 0, max: 1, order: 305 },
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
      blobsGridPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  usePresetHighlight(blobsGridPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <BlobsGrid {...params} colors={colors} className="fixed size-full" />
    </>
  );
};

export default BlobsGridWithControls;
