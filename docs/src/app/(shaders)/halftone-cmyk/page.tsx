'use client';

import { HalftoneCmyk, halftoneCmykPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import {
  HalftoneCmykType,
  HalftoneCmykTypes,
  ShaderFit,
} from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { halftoneCmykDef } from '@/shader-defs/halftone-cmyk-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = halftoneCmykPresets[0].params;

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

const HalftoneCmykWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | string>('/images/image-filters/002.webp');
  const [status, setStatus] = useState('Click to load an image');

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
    setImage(img ?? '');
    setImageIdx(-1);
    setStatus(``);
  }, []);

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      halftoneCmykPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      // colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      // colorC: { value: toHsla(defaults.colorC), order: 101 },
      // colorM: { value: toHsla(defaults.colorM), order: 102 },
      // colorY: { value: toHsla(defaults.colorY), order: 103 },
      // colorK: { value: toHsla(defaults.colorK), order: 104 },
      size: { value: defaults.size, min: 0.01, max: 1, step: 0.01, order: 120 },
      // gridNoise: { value: defaults.gridNoise, min: 0, max: 1, step: 0.01, order: 121 },
      type: {
        value: defaults.type,
        options: Object.keys(HalftoneCmykTypes) as HalftoneCmykType[],
        order: 123,
      },
      softness: { value: defaults.softness, min: 0, max: 1, step: 0.01, order: 124 },
      // contrast: { value: defaults.contrast, min: 0, max: 2, step: 0.01, order: 130 },
      // floodC: { value: defaults.floodC, min: 0, max: 1, step: 0.01, order: 210 },
      // floodM: { value: defaults.floodM, min: 0, max: 1, step: 0.01, order: 211 },
      // floodY: { value: defaults.floodY, min: 0, max: 1, step: 0.01, order: 212 },
      // floodK: { value: defaults.floodK, min: 0, max: 1, step: 0.01, order: 213 },
      // gainC: { value: defaults.gainC, min: -1, max: 1, step: 0.01, order: 200 },
      // gainM: { value: defaults.gainM, min: -1, max: 1, step: 0.01, order: 201 },
      // gainY: { value: defaults.gainY, min: -1, max: 1, step: 0.01, order: 202 },
      // gainK: { value: defaults.gainK, min: -1, max: 1, step: 0.01, order: 203 },
      // grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 350 },
      // grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 351 },
      // grainSize: { value: defaults.grainSize, min: 0, max: 1, order: 350 },
      // // offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 401 },
      // // offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 402 },
      // // originX: { value: defaults.originX, min: 0, max: 1, order: 411 },
      // // originY: { value: defaults.originY, min: 0, max: 1, order: 412 },
      // // rotation: { value: defaults.rotation, min: 0, max: 360, order: 420 },
      // scale: { value: defaults.scale, min: 0, max: 10, order: 420 },
      // fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 450 },
      // Image: folder(
      //   {
      //     'Upload image': levaImageButton(setImageWithoutStatus),
      //   },
      //   { order: 0 }
      // ),
      // Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, halftoneCmykDef);
  usePresetHighlight(halftoneCmykPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={halftoneCmykDef} currentParams={params}>
        <HalftoneCmyk onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="text-current/70 mx-auto mb-48 mt-16 w-fit select-none text-base">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={halftoneCmykDef} currentParams={params} />
    </>
  );
};

export default HalftoneCmykWithControls;
