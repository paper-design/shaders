'use client';

import { Prism, prismPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, prismMeta } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { ShaderDetails } from '@/components/shader-details';
import { prismDef } from '@/shader-defs/prism-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = prismPresets[0].params;

const imageFiles = [
  // 'test.png',
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

const PrismWithControls = () => {
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
      prismPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      spread: { value: defaults.spread, min: 0, max: 1, order: 100 },
      spreadBias: { value: defaults.spreadBias, min: -1, max: 1, order: 101 },
      spreadAngle: { value: defaults.spreadAngle, min: 0, max: 360, order: 102 },
      spreadPerspective: { value: defaults.spreadPerspective, min: 0, max: 1, order: 103 },
      samples: { value: defaults.samples, min: 2, max: prismMeta.maxSamples, step: 1, order: 104 },
      colorRange: { value: defaults.colorRange, min: 0, max: 1, order: 105 },
      colorShift: { value: defaults.colorShift, min: 0, max: 360, order: 106 },
      focusCenter: { value: defaults.focusCenter, min: 0, max: 1, order: 204 },
      focusEdges: { value: defaults.focusEdges, min: 0, max: 1, order: 205 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 300 },
      noiseFrequency: { value: defaults.noiseFrequency, min: 0, max: 15, order: 301 },
      noiseOffset: { value: defaults.noiseOffset, min: 0, max: 10, order: 302 },
      lensBulge: { value: defaults.lensBulge, min: 0, max: 1, order: 400 },
      lensRound: { value: defaults.lensRound, min: 0, max: 1, order: 402 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 409 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 410 },
      debugCircle: { value: defaults.debugCircle, order: 500 },
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
  useUrlParams(params, setParams, prismDef);
  usePresetHighlight(prismPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={prismDef} currentParams={params}>
        <Prism onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={prismDef} currentParams={params} />
    </>
  );
};

export default PrismWithControls;
