'use client';

import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { levaImageButton } from '@/helpers/leva-image-button';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { type ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { Pixelate, pixelatePresets } from '@paper-design/shaders-react';
import { button, folder, useControls } from 'leva';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

/**
 * This example has controls added so you can play with settings in the example app
 */

const { ...defaults } = pixelatePresets[0].params;

const PixelateWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);

  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const imageFiles = [
    '01.png',
    '02.jpg',
    '04.png',
    '05.jpg',
    '06.jpg',
    '07.webp',
    '08.png',
    '010.png',
    '011.png',
    '012.png',
    '013.png',
    '014.png',
    '015.png',
    '016.jpg',
  ] as const;

  useEffect(() => {
    const img = new Image();
    img.src = `/images/${imageFiles[imageIdx]}`;
    img.onload = () => {
      setImage(img);
    };
  }, [imageIdx]);

  const handleClick = useCallback(() => {
    setImageIdx((prev) => (prev + 1) % imageFiles.length);
  }, []);

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      pixelatePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset, setImage)),
      ])
    );
    return {
      Parameters: folder(
        {
          sizeX: { value: defaults.sizeX, min: 1, max: 200, step: 1, order: 100 },
          sizeY: { value: defaults.sizeY, min: 1, max: 200, step: 1, order: 101 },
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
          order: 4,
          collapsed: true,
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
          order: 5,
          collapsed: true,
        }
      ),
      Image: folder(
        {
          'Upload image': levaImageButton(setImage),
        },
        {
          order: 3,
          collapsed: false,
        }
      ),

      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(pixelatePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Pixelate className="fixed size-full" onClick={handleClick} {...params} image={image || undefined} />
    </>
  );
};

export default PixelateWithControls;
