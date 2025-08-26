'use client';

import { ImageDithering, imageDitheringPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { DitheringType, DitheringTypes, ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderPageContent } from '@/components/shader-page-content';
import { imageDitheringDef } from '@/shader-defs/image-dithering-def';
import { Header } from '@/components/header';

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = imageDitheringPresets[0].params;

const imageFiles = [
  '001.webp',
  '002.webp',
  '003.webp',
  '004.webp',
  '005.webp',
  '006.webp',
  '007.webp',
  '008.webp',
  '009.webp',
  '0010.webp',
  '0011.webp',
  '0012.webp',
  '0013.webp',
  '0014.webp',
  '0015.webp',
  '0016.webp',
  '0017.webp',
  '0018.webp',
] as const;

const ImageDitheringWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState('Click to load an image');

  const fileName = imageIdx >= 0 ? imageFiles[imageIdx] : null;

  useEffect(() => {
    if (imageIdx >= 0) {
      const name = imageFiles[imageIdx];
      setStatus(`Displaying image: ${name}`);
      const img = new Image();
      img.src = `/images/image-filters/${name}`;
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
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 102 },
      colorHighlight: { value: toHsla(defaults.colorHighlight), order: 103 },
      originalColors: { value: defaults.originalColors, order: 104 },
      type: { value: defaults.type, options: Object.keys(DitheringTypes) as DitheringType[], order: 200 },
      pxSize: { value: defaults.pxSize, min: 0.5, max: 20, step: 1, order: 201 },
      colorSteps: { value: defaults.colorSteps, min: 1, max: 7, step: 1, order: 202 },
      scale: { value: defaults.scale, min: 0.5, max: 10, order: 300 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 301 },
      Image: folder(
        {
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
    <div className="page-container">
      <Header title={imageDitheringDef.name} />

      <div className="my-12">
        <ImageDithering className="my-4 aspect-16/9" onClick={handleClick} {...params} image={image || undefined} />
        <div onClick={handleClick} className="mx-auto w-fit text-base text-stone-600 select-none">
          Click to change the sample image
        </div>
      </div>

      <ShaderPageContent shaderDef={imageDitheringDef} currentParams={params} />
    </div>
  );
};

export default ImageDitheringWithControls;
