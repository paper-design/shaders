'use client';

import { LensDistortion, lensDistortionPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, lensDistortionMeta } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { ShaderDetails } from '@/components/shader-details';
import { lensDistortionDef } from '@/shader-defs/lens-distortion-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = lensDistortionPresets[0].params;

const builtInImages = [
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
].map((name) => `/images/image-filters/${name}`);

const LensDistortionWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | string>('/images/image-filters/0018.webp');
  // Cycle list: the built-in samples plus any extra images from the external lens-distortion folder
  // (served via the gitignored public/images/lens-distortion symlink, listed by the API route).
  const [images, setImages] = useState<string[]>(builtInImages);

  useEffect(() => {
    fetch('/api/lens-distortion-images')
      .then((r) => r.json())
      .then((extra: string[]) => {
        if (Array.isArray(extra) && extra.length) setImages([...extra, ...builtInImages]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (imageIdx >= 0) {
      const img = new Image();
      img.src = images[imageIdx];
      img.onload = () => setImage(img);
    }
  }, [imageIdx, images]);

  const handleClick = useCallback(() => {
    setImageIdx((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const setImageWithoutStatus = useCallback((img?: HTMLImageElement) => {
    setImage(img ?? '');
    setImageIdx(-1);
  }, []);

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      lensDistortionPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      spread: { value: defaults.spread, min: 0, max: 1, order: 100 },
      bias: { value: defaults.bias, min: -1, max: 1, order: 101 },
      angle: { value: defaults.angle, min: 0, max: 360, order: 102 },
      perspective: { value: defaults.perspective, min: 0, max: 1, order: 103 },
      count: { value: defaults.count, min: 2, max: lensDistortionMeta.maxSamples, step: 1, order: 104 },
      colorFade: { value: defaults.colorFade, min: 0, max: 1, order: 105 },
      colorShift: { value: defaults.colorShift, min: 0, max: 1, order: 106 },
      focusCenter: { value: defaults.focusCenter, min: 0, max: 1, order: 204 },
      focusEdges: { value: defaults.focusEdges, min: 0, max: 1, order: 205 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 300 },
      noiseFrequency: { value: defaults.noiseFrequency, min: 0, max: 1, order: 301 },
      noiseOffset: { value: defaults.noiseOffset, min: 0, max: 30, order: 302 },
      lensBulge: { value: defaults.lensBulge, min: -1, max: 1, order: 400 },
      lensCircle: { value: defaults.lensCircle, min: 0, max: 1, order: 402 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 409 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 410 },
      imageX: { value: defaults.imageX, min: -1, max: 1, order: 411 },
      imageY: { value: defaults.imageY, min: -1, max: 1, order: 412 },
      scale: { value: defaults.scale, min: 0.5, max: 4, order: 450 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 451 },
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
  useUrlParams(params, setParams, lensDistortionDef);
  usePresetHighlight(lensDistortionPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={lensDistortionDef} currentParams={params}>
        <LensDistortion onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={lensDistortionDef} currentParams={params} />
    </>
  );
};

export default LensDistortionWithControls;
