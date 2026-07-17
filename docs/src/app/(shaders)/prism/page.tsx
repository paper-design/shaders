'use client';

import { Prism, prismPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit, prismMeta } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { toHsla } from '@/helpers/color-utils';
import { useState, useEffect, useCallback } from 'react';
import { ShaderDetails } from '@/components/shader-details';
import { prismDef } from '@/shader-defs/prism-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = prismPresets[0].params;

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
      colorBack: { value: toHsla(defaults.colorBack), order: 99 },
      colorSteps: { value: defaults.colorSteps, min: 2, max: prismMeta.maxColorSteps, step: 1, order: 100 },
      hue: { value: defaults.hue, min: 0, max: 360, order: 101 },
      shift: { value: defaults.shift, min: 0, max: 1, order: 200 },
      shiftBias: { value: defaults.shiftBias, min: -1, max: 1, order: 201 },
      shiftAngle: { value: defaults.shiftAngle, min: 0, max: 360, order: 202 },
      perspective: { value: defaults.perspective, min: 0, max: 1, order: 203 },
      centerFalloff: { value: defaults.centerFalloff, min: 0, max: 1, order: 204 },
      edgeFalloff: { value: defaults.edgeFalloff, min: 0, max: 1, order: 205 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 300 },
      noiseFrequency: { value: defaults.noiseFrequency, min: 0, max: 20, order: 301 },
      noiseOffset: { value: defaults.noiseOffset, min: 0, max: 10, order: 302 },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 400 },
      distortionRadiality: { value: defaults.distortionRadiality, min: 0, max: 1, order: 401 },
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
