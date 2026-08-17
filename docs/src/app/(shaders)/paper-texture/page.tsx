'use client';

import { PaperTexture, paperTexturePresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, paperTextureMeta } from '@paper-design/shaders';
import { levaImageButton, levaDeleteImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { paperTextureDef } from '@/shader-defs/paper-texture-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = paperTexturePresets[0].params;

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

const PaperTextureWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | string>('/images/image-filters/0018.webp');

  useEffect(() => {
    if (imageIdx >= 0) {
      const name = imageFiles[imageIdx];
      const img = new Image();
      img.src = `/images/image-filters/${name}`;
      img.onload = () => setImage(img);
    }
  }, [imageIdx]);

  const handleClick = useCallback(() => {
    setImageIdx((prev) => (prev + 1) % imageFiles.length);
  }, []);

  const setImageWithoutStatus = useCallback((img?: HTMLImageElement) => {
    setImage(img ?? '');
    setImageIdx(-1);
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
      seed: { value: defaults.seed, min: 0, step: 1, max: 1000, order: 200 },
      lightAngle: { value: defaults.lightAngle, min: 0, max: 360, order: 201 },
      roughness: { value: defaults.roughness, min: 0, max: 1, order: 300 },
      roughnessSize: { value: defaults.roughnessSize, min: 0, max: 1, order: 301 },
      fiber: { value: defaults.fiber, min: 0, max: 1, order: 310 },
      fiberSize: { value: defaults.fiberSize, min: 0, max: 1, order: 311 },
      folds: { value: defaults.folds, min: 0, max: 1, order: 320 },
      foldCount: { value: defaults.foldCount, min: 1, max: paperTextureMeta.maxFoldCount, step: 1, order: 321 },
      creases: { value: defaults.creases, min: 0, max: 1, order: 330 },
      creaseSizeX: { value: defaults.creaseSizeX, min: 0, max: 1, order: 331 },
      creaseOffsetX: { value: defaults.creaseOffsetX, min: 0, max: 1, order: 332 },
      creaseSizeY: { value: defaults.creaseSizeY, min: 0, max: 1, order: 333 },
      creaseOffsetY: { value: defaults.creaseOffsetY, min: 0, max: 1, order: 334 },
      drops: { value: defaults.drops, min: 0, max: 1, order: 340 },
      blending: { value: defaults.blending, min: 0, max: 1, order: 350 },
      distortion: { value: defaults.distortion, min: -1, max: 1, order: 351 },
      background: { value: defaults.background, order: 352 },

      scale: { value: defaults.scale, min: 0.5, max: 10, order: 400 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 401 },
      Image: folder(
        {
          'Upload image': levaImageButton(setImageWithoutStatus),
          ...(image && { 'Delete image': levaDeleteImageButton(() => setImage('')) }),
        },
        { order: 0 }
      ),
      Presets: folder(presets, { order: -1 }),
    };
  }, [image]);

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, paperTextureDef);
  usePresetHighlight(paperTexturePresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={paperTextureDef} currentParams={params}>
        <PaperTexture onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={paperTextureDef} currentParams={params} />
    </>
  );
};

export default PaperTextureWithControls;
