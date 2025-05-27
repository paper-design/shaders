'use client';

import { FlutedGlass, flutedGlassPresets } from '@paper-design/shaders-react';

import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFitOptions } from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect } from 'react';

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = flutedGlassPresets[0].params;

const FlutedGlassWithControls = () => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    // img.src = '/image-landscape.webp';
    img.src = '/image-portrait.webp';
    img.onload = () => {
      setImage(img);
    };
  }, []);

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      flutedGlassPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Parameters: folder({}, { order: 1 }),
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
      Image: folder(
        {
          'Upload image': levaImageButton(setImage),
        },
        {
          order: 4,
          collapsed: false,
        }
      ),

      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(flutedGlassPresets, params);
  cleanUpLevaParams(params);

  if (image === null) {
    return null;
  }

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <FlutedGlass className="fixed size-full" {...params} image={image} />
    </>
  );
};

export default FlutedGlassWithControls;
