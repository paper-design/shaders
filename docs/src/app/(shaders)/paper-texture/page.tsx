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
import { ShaderPageContent } from '@/components/shader-page-content';
import { paperTextureDef } from '@/shader-defs/paper-texture-def';

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
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 101 },
      contrast: { value: defaults.contrast, min: 0, max: 1, order: 200 },
      roughness: { value: defaults.roughness, min: 0, max: 1, order: 201 },
      fiber: { value: defaults.fiber, min: 0, max: 1, order: 202 },
      fiberScale: { value: defaults.fiberScale, min: 0.1, max: 2, order: 203 },
      crumples: { value: defaults.crumples, min: 0, max: 1, order: 204 },
      crumplesScale: { value: defaults.crumplesScale, min: 0.3, max: 3, order: 205 },
      folds: { value: defaults.folds, min: 0, max: 1, order: 206 },
      foldsNumber: { value: defaults.foldsNumber, min: 1, max: 15, step: 1, order: 207 },
      blur: { value: defaults.blur, min: 0, max: 1, order: 208 },
      drops: { value: defaults.drops, min: 0, max: 1, order: 209 },
      seed: { value: defaults.seed, min: 0, max: 10, order: 250 },
      scale: { value: defaults.scale, min: 0.5, max: 10, order: 300 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 301 },
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
      <div onClick={handleClick} className="py-3 text-center select-none">
        Click to change sample image
      </div>
      <ShaderPageContent shaderDef={paperTextureDef} currentParams={params} />
    </div>
  );
};

export default PaperTextureWithControls;
