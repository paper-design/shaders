'use client';

import { PaperTexture, paperTexturePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton, levaDeleteImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = paperTexturePresets[0].params;

const PaperTextureWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState('Click to load an image');

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
      paperTexturePresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 101 },
      colorFront: { value: toHsla(defaults.colorFront), order: 100 },
      contrast: { value: defaults.contrast, min: 0, max: 1, order: 200 },
      roughness: { value: defaults.roughness, min: 0, max: 1, order: 300 },
      fiber: { value: defaults.fiber, min: 0, max: 1, order: 310 },
      fiberScale: { value: defaults.fiberScale, min: 0.1, max: 2, order: 310 },
      crumples: { value: defaults.crumples, min: 0, max: 1, order: 320 },
      crumplesScale: { value: defaults.crumplesScale, min: 0.3, max: 3, order: 322 },
      folds: { value: defaults.folds, min: 0, max: 1, order: 330 },
      foldsNumber: { value: defaults.foldsNumber, min: 1, max: 15, step: 1, order: 331 },
      blur: { value: defaults.blur, min: 0, max: 1, order: 340 },
      drops: { value: defaults.drops, min: 0, max: 1, order: 350 },
      seed: { value: defaults.seed, min: 0, max: 10, order: 351 },
      scale: { value: defaults.scale, min: 0.5, max: 10, order: 101 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 100 },
      Image: folder(
        {
          'Upload image': levaImageButton(setImageWithoutStatus),
          'Delete image': levaDeleteImageButton(setImageWithoutStatus),
        },
        { order: 0 }
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
    <div>
      <ShaderContainer>
        <PaperTexture onClick={handleClick} {...params} image={image || undefined} />
      </ShaderContainer>
      <div onClick={handleClick} className="select-none py-3 text-center">
        Click to change sample image
      </div>
      <ShaderDetails
        name="Paper Texture"
        currentParams={params}
        description="Mimicking paper texture with a combination of noises."
        props={{
          'colorFront, colorBack': 'Colors used for the effect.',
          'contrast': 'Mixing front and back colors.',
          'roughness': 'Pixel noise, related to canvas (not scalable).',
          'fiber': 'Curly-shaped noise.',
          'fiberScale': 'Curly-shaped noise scale.',
          'crumples': 'Cell-based pattern.',
          'crumplesScale': 'Cell-based pattern scale.',
          'folds': 'Depth of the folds.',
          'foldsNumber': 'Number of folds (15 max).',
          'drops': 'Metaballs-like pattern.',
          'seed': 'Applied to folds, crumples and dots.',
          'blur': 'Big-scale noise mask applied to everything but roughness.',
        }}
      />
    </div>
  );
};

export default PaperTextureWithControls;
