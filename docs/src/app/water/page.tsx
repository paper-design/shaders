'use client';

import { Water, waterPresets } from '@paper-design/shaders-react';
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

const { worldWidth, worldHeight, ...defaults } = waterPresets[0].params;

const WaterWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState('Click to load an image');

  const imageFiles = [
    '086.png',
    '085.png',
    '078.jpg',
    '043.jpg',
    '079.jpg',
    '069.jpg',
    '070.jpg',
    '080.jpg',
    '081.jpg',
    '082.jpg',
    '072.jpg',
    '073.jpg',
    '074.jpg',
    '075.jpg',
    '076.jpg',

    '083.jpg',

    '067.jpg',
    '068.jpg',

    '049.jpg',
    '050.jpg',
    '051.jpg',
    '052.jpg',
    '053.jpg',
    '054.jpg',
    '055.jpg',
    '056.jpg',
    '057.jpg',
    '058.jpg',
    '059.jpg',
    '060.jpg',
    '061.jpg',

    '063.jpg',
    '064.jpg',
    '065.jpg',
    '066.jpg',
    '01.jpg',
    '02.jpg',
    '03.jpg',
    '04.jpg',
    '05.jpg',
    '06.jpg',
    '09.jpg',
    '010.jpg',
    '013.jpg',
    '015.jpg',
    '019.jpg',
    '020.jpg',
    '021.jpg',
    '022.jpg',
    '023.jpg',
    '024.jpg',
    '025.jpg',
    '026.jpg',
    '027.jpg',
    '028.jpg',
    '029.jpg',
    '030.jpg',
    '031.jpg',
    '032.jpg',
    '033.jpg',
    '034.jpg',
    '035.jpg',
    '037.jpg',
    '038.jpg',
    '039.jpg',
    '040.jpg',
    '041.jpg',
    '042.jpg',
    '043.jpg',
    '044.jpg',
    '045.jpg',
    '046.jpg',
    '047.jpg',
    '048.jpg',
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
      waterPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset, setImage)),
      ])
    );
    return {
      Parameters: folder(
        {
          colorBack: { value: toHsla(defaults.colorBack), order: 100 },
          highlights: { value: defaults.highlights, min: 0, max: 1, order: 101 },
          temperature: { value: defaults.temperature, min: 0, max: 1, order: 102 },
          layering: { value: defaults.layering, min: 0, max: 1, order: 102 },
          edges: { value: defaults.edges, min: 0, max: 1, order: 102 },
          waves: { value: defaults.waves, min: 0, max: 1, order: 250 },
          caustic: { value: defaults.caustic, min: 0, max: 1, order: 251 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
          effectScale: { value: defaults.effectScale, min: 0, max: 50, order: 0 },
        },
        { order: 0 }
      ),
      Image: folder(
        {
          'fit': { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 100 },
          'scale': { value: defaults.scale, min: 0.01, max: 4, order: 101 },
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
