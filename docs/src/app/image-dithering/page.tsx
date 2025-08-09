'use client';

import { ImageDithering, imageDitheringPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { DitheringType, DitheringTypes, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/to-hsla';

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = imageDitheringPresets[0].params;

const ImageDitheringWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState('Click to load an image');

  const imageFiles = [
    '083.jpg',
    // 'transparency-test-chatgpt.png',
    '088.jpg',
    '030.jpg',

    '074.jpg',
    '075.jpg',
    '068.jpg',
    '059.jpg',
    '060.jpg',

    '054.jpg',
    '031.jpg',
    '032.jpg',
    '061.jpg',
    '063.jpg',
    '019.jpg',
    '020.jpg',
    '034.jpg',
    '039.jpg',
    '041.jpg',
    '042.jpg',
    '043.jpg',
    '082.jpg',
    '046.jpg',
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

  const setImageWithoutStatus = useCallback((img?: HTMLImageElement) => {
    setImage(img);
    setImageIdx(-1);
    setStatus(``);
  }, []);

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      imageDitheringPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: toHsla(defaults.colorBack), order: 100 },
          colorFront: { value: toHsla(defaults.colorFront), order: 101 },
          colorHighlight: { value: toHsla(defaults.colorHighlight), order: 102 },
          type: { value: defaults.type, options: Object.keys(DitheringTypes) as DitheringType[], order: 103 },
          pxSize: { value: defaults.pxSize, min: 1, max: 20, step: 1, order: 104 },
          colorSteps: { value: defaults.colorSteps, min: 1, max: 7, step: 1, order: 105 },
          ownPalette: { value: defaults.ownPalette, order: 106 },
        },
        { order: 1 }
      ),
      Image: folder(
        {
          'fit': { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 100 },
          'scale': { value: defaults.scale, min: 0.5, max: 4, order: 101 },
          // rotation: {value: defaults.rotation, min: 0, max: 360, order: 401},
          // offsetX: {value: defaults.offsetX, min: -1, max: 1, order: 402},
          // offsetY: {value: defaults.offsetY, min: -1, max: 1, order: 403},
          'Upload image': levaImageButton(setImageWithoutStatus),
        },
        { order: 0 }
      ),

      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(imageDitheringPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <ImageDithering className="fixed size-full" onClick={handleClick} {...params} image={image || undefined} />
      <div
        className="fixed bottom-3 left-3 rounded px-2 py-1 text-xs"
        style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
      >
        {fileName ? `Displaying image: ${fileName}` : 'Click to load an image'}
      </div>
    </>
  );
};

export default ImageDitheringWithControls;
