'use client';

import { PaperTexture, paperTexturePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/to-hsla';

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = paperTexturePresets[0].params;

const PaperTextureWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState('Click to load an image');

  const imageFiles = [
    '068.jpg',
    // '086.png',
    '040.jpg',
    '049.jpg',
    '059.jpg',
    '06.jpg',
    '030.jpg',
    '063.jpg',
    '023.jpg',
    '048.jpg',

    '085.png',
    '072.jpg',
    '073.jpg',
    '074.jpg',
    '083.jpg',

    '060.jpg',

    '02.jpg',
    '031.jpg',
    '032.jpg',
    '034.jpg',

    '051.jpg',
    '052.jpg',
    '053.jpg',
    '055.jpg',
    '057.jpg',
    '058.jpg',
    '061.jpg',
    '065.jpg',
    '066.jpg',
    '03.jpg',
    '09.jpg',
    '010.jpg',
    '013.jpg',
    '019.jpg',
    '020.jpg',
    '022.jpg',
    '024.jpg',
    '025.jpg',
    '027.jpg',
    '028.jpg',
    '029.jpg',
    '035.jpg',
    '037.jpg',
    '039.jpg',
    '041.jpg',
    '046.jpg',
    '047.jpg',
  ] as const;

  const fileName = imageIdx >= 0 ? imageFiles[imageIdx] : null;

  useEffect(() => {
    if (imageIdx >= 0) {
      const name = imageFiles[imageIdx];
      setStatus(`Displaying image: ${name}`);
      const img = new Image();
      img.src = `/images/${name}`;
      img.onload = () => setImage(img);
    }
  }, [imageIdx]);

  const handleClick = useCallback(() => {
    setImageIdx((prev) => (prev + 1) % imageFiles.length);
  }, []);

  const setImageWithStatus = useCallback((img?: HTMLImageElement) => {
    setImage(img);
    setStatus(`Displaying image: uploaded image`);
  }, []);

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      paperTexturePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Parameters: folder(
        {
          colorFront: { value: toHsla(defaults.colorFront), order: 100 },
          colorBack: { value: toHsla(defaults.colorBack), order: 101 },
          contrast: { value: defaults.contrast, min: 0, max: 1, order: 200 },

          grain: { value: defaults.grain, min: 0, max: 1, order: 300 },

          fiber: { value: defaults.fiber, min: 0, max: 1, order: 310 },
          fiberScale: { value: defaults.fiberScale, min: 0.1, max: 2, order: 310 },

          crumples: { value: defaults.crumples, min: 0, max: 1, order: 320 },
          crumplesSeed: { value: defaults.crumplesSeed, min: 0, max: 1000, order: 321 },
          crumplesScale: { value: defaults.crumplesScale, min: 0.3, max: 3, order: 322 },

          folds: { value: defaults.folds, min: 0, max: 1, order: 330 },
          foldsNumber: { value: defaults.foldsNumber, min: 1, max: 15, step: 1, order: 331 },
          foldsSeed: { value: defaults.foldsSeed, min: 0, max: 1000, order: 332 },

          blur: { value: defaults.blur, min: 0, max: 1, order: 340 },
          blurSeed: { value: defaults.blurSeed, min: 0, max: 10, order: 341 },

          drops: { value: defaults.drops, min: 0, max: 1, order: 350 },
          dropsSeed: { value: defaults.dropsSeed, min: 0, max: 10, order: 351 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.5, max: 2, order: 400 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 402 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 403 },
        },
        {
          order: 2,
          collapsed: true,
        }
      ),
      Image: folder(
        {
          'fit': { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 100 },
          'scale': { value: defaults.scale, min: 0.5, max: 4, order: 101 },
          // rotation: {value: defaults.rotation, min: 0, max: 360, order: 401},
          // offsetX: {value: defaults.offsetX, min: -1, max: 1, order: 402},
          // offsetY: {value: defaults.offsetY, min: -1, max: 1, order: 403},
          'Upload image': levaImageButton(setImageWithStatus),
        },
        { order: 2 }
      ),

      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(paperTexturePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <PaperTexture className="fixed size-full" onClick={handleClick} {...params} image={image || undefined} />
      <div
        className="fixed bottom-3 left-3 rounded px-2 py-1 text-xs"
        style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
      >
        {fileName ? `Displaying image: ${fileName}` : 'Click to load an image'}
      </div>
    </>
  );
};

export default PaperTextureWithControls;
