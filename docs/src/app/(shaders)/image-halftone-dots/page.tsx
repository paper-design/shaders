'use client';

import { ImageHalftoneDots, imageHalftoneDotsPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import {heatmapMeta, ShaderFit} from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { imageHalftoneDotsDef } from '@/shader-defs/image-halftone-dots-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { useColors } from '@/helpers/use-colors';

const { worldWidth, worldHeight, ...defaults } = imageHalftoneDotsPresets[0].params;

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

const ImageHalftoneDotsWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: heatmapMeta.maxColorCount,
  });

  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | string>('/images/image-filters/0018.webp');
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
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      originalColors: { value: defaults.originalColors, order: 102 },
      gooey: { value: defaults.gooey, order: 200 },
      inverted: { value: defaults.gooey, order: 201 },
      size: { value: defaults.size, min: 1, max: 100, order: 300 },
      radius: { value: defaults.radius, min: 0, max: 1, order: 301 },
      contrast: { value: defaults.contrast, min: 0, max: 1, order: 302 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 350 },
      scale: { value: defaults.scale, min: 0.1, max: 10, order: 351 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 302 },
      Image: folder(
        {
          'Upload image': levaImageButton(setImageWithoutStatus),
        },
        { order: 0 }
      ),
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      imageHalftoneDotsPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: -2 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, imageHalftoneDotsDef);
  usePresetHighlight(imageHalftoneDotsPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={imageHalftoneDotsDef} currentParams={params}>
        <ImageHalftoneDots onClick={handleClick} {...params} colors={ colors } image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={imageHalftoneDotsDef} currentParams={params} />
    </>
  );
};

export default ImageHalftoneDotsWithControls;
