'use client';

import { HalftoneLines, halftoneLinesPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { HalftoneLinesGrid, HalftoneLinesGrids, ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { halftoneLinesDef } from '@/shader-defs/halftone-lines-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = halftoneLinesPresets[0].params;

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

const HalftoneLinesWithControls = () => {
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
      halftoneLinesPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 101 },
      colorMid: { value: toHsla(defaults.colorMid), order: 102 },
      originalColors: { value: defaults.originalColors, order: 103 },

      strokeContrast: { value: defaults.strokeContrast, min: 0, max: 1, order: 200 },
      strokeInverted: { value: defaults.strokeInverted, order: 201 },
      imageSoftness: { value: defaults.imageSoftness, min: 0, max: 1, order: 202 },
      colorSoftness: { value: defaults.colorSoftness, min: 0, max: 1, order: 203 },
      strokeWidth: { value: defaults.strokeWidth, min: 0, max: 1, order: 204 },
      strokeSoftness: { value: defaults.strokeSoftness, min: 0, max: 1, order: 205 },
      strokeKeepGaps: { value: defaults.strokeKeepGaps, order: 206 },
      strokeKeepWidth: { value: defaults.strokeKeepWidth, order: 207 },

      gridType: {
        value: defaults.gridType,
        options: Object.keys(HalftoneLinesGrids) as HalftoneLinesGrid[],
        order: 250,
      },
      gridSize: { value: defaults.gridSize, min: 0, max: 1, order: 251 },
      gridOffset: { value: defaults.gridOffset, min: -1, max: 1, order: 252 },
      gridRotation: { value: defaults.gridRotation, min: 0, max: 180, order: 254 },
      gridNoise: { value: defaults.gridNoise, min: 0, max: 1, order: 255 },
      gridContouring: { value: defaults.gridContouring, min: -1, max: 1, order: 256 },

      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 350 },
      grainMixerSize: { value: defaults.grainMixerSize, min: 0, max: 1, order: 351 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 352 },
      grainOverlaySize: { value: defaults.grainOverlaySize, min: 0, max: 1, order: 353 },

      scale: { value: defaults.scale, min: 0.1, max: 4, order: 400 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 450 },
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
  useUrlParams(params, setParams, halftoneLinesDef);
  usePresetHighlight(halftoneLinesPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={halftoneLinesDef} currentParams={params}>
        <HalftoneLines onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={halftoneLinesDef} currentParams={params} />
    </>
  );
};

export default HalftoneLinesWithControls;
