'use client';

import { Water, waterPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { levaImageButton, levaDeleteImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/to-hsla';

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = waterPresets[0].params;

const WaterWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState('Click to load an image');

  const imageFiles = [
    '063.jpg',
    '049.jpg',
    '074.jpg',
    '031.jpg',
    '070.jpg',
    '035.jpg',
    '030.jpg',
    '075.jpg',
    '034.jpg',
    '059.jpg',
    '040.jpg',
    '066.jpg',

    // '087.png',
    '086.png',
    '085.png',
    '072.jpg',

    '083.jpg',

    '067.jpg',
    '068.jpg',

    '050.jpg',
    '052.jpg',
    '054.jpg',
    '055.jpg',
    '060.jpg',
    '061.jpg',

    '065.jpg',
    '01.jpg',
    '02.jpg',
    '06.jpg',
    '09.jpg',
    '013.jpg',
    '015.jpg',
    '019.jpg',
    '024.jpg',
    '028.jpg',
    '032.jpg',
    '037.jpg',
    '038.jpg',
    '039.jpg',
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
      waterPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: toHsla(defaults.colorBack), order: 100 },
          highlightColor: { value: toHsla(defaults.highlightColor), order: 101 },
          highlights: { value: defaults.highlights, min: 0, max: 1, order: 102 },
          layering: { value: defaults.layering, min: 0, max: 1, order: 103 },
          edges: { value: defaults.edges, min: 0, max: 1, order: 104 },
          waves: { value: defaults.waves, min: 0, max: 1, order: 250 },
          caustic: { value: defaults.caustic, min: 0, max: 1, order: 251 },
          speed: { value: defaults.speed, min: 0, max: 3, order: 400 },
          effectScale: { value: defaults.effectScale, min: 0.01, max: 5, order: 0 },
        },
        { order: 1 }
      ),
      Image: folder(
        {
          'Upload image': levaImageButton(setImageWithoutStatus),
          'Delete image': levaDeleteImageButton(setImageWithoutStatus),
        },
        { order: 0 }
      ),
      ImageControls: folder(
        {
          'fit': { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 100 },
          'scale': { value: defaults.scale, min: 0.5, max: 4, order: 101 },
          // rotation: {value: defaults.rotation, min: 0, max: 360, order: 401},
          // offsetX: {value: defaults.offsetX, min: -1, max: 1, order: 402},
          // offsetY: {value: defaults.offsetY, min: -1, max: 1, order: 403},
        },
        { order: 3 }
      ),

      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(waterPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Water className="fixed size-full" onClick={handleClick} {...params} image={image || undefined} />
      <div
        className="fixed bottom-3 left-3 rounded px-2 py-1 text-xs"
        style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
      >
        {fileName ? `Displaying image: ${fileName}` : 'Click to load an image'}
      </div>
    </>
  );
};

export default WaterWithControls;
