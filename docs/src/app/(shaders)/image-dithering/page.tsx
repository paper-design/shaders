'use client';

import { ImageDithering, imageDitheringPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { DitheringType, DitheringTypes, ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { imageDitheringDef } from '@/shader-defs/image-dithering-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { htmlOnly, imageOnly, useIsHtmlInCanvasPage } from '@/helpers/html-in-canvas-page';
import { HtmlInCanvasShaderPage } from '@/components/html-in-canvas-shader-page';
import { css, html, htmlInCanvasParams } from './html-in-canvas/demo';

const { worldWidth, worldHeight, ...presetDefaults } = imageDitheringPresets[0].params;

const htmlInCanvasDefaults = { ...presetDefaults, ...htmlInCanvasParams };

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
  const isHtmlInCanvas = useIsHtmlInCanvasPage();
  const defaults = isHtmlInCanvas ? htmlInCanvasDefaults : presetDefaults;
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
      inverted: { value: defaults.inverted, order: 105 },
      type: { value: defaults.type, options: Object.keys(DitheringTypes) as DitheringType[], order: 200 },
      size: { value: defaults.size, min: 0.5, max: 20, order: 201 },
      colorSteps: { value: defaults.colorSteps, min: 1, max: 7, step: 1, order: 202 },
      scale: { value: defaults.scale, min: 0.1, max: 4, order: 300, ...imageOnly },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 301, ...imageOnly },
      Image: folder(
        {
          'Upload image': levaImageButton(setImageWithoutStatus),
        },
        { order: 0, ...imageOnly }
      ),
      Presets: folder(presets, { order: -1, ...imageOnly }),
      Preset: folder({ Reset: button(() => setParamsSafe(params, setParams, defaults)) }, { order: -1, ...htmlOnly }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, imageDitheringDef);
  usePresetHighlight(isHtmlInCanvas ? [{ name: 'Reset', params: defaults }] : imageDitheringPresets, params);
  cleanUpLevaParams(params);

  if (isHtmlInCanvas) {
    return (
      <HtmlInCanvasShaderPage
        shaderDef={imageDitheringDef}
        currentParams={params}
        defaultParams={presetDefaults}
        html={html}
        css={css}
      >
        <ImageDithering {...params}>{html}</ImageDithering>
      </HtmlInCanvasShaderPage>
    );
  }

  return (
    <>
      <ShaderContainer shaderDef={imageDitheringDef} currentParams={params}>
        <ImageDithering onClick={handleClick} {...params} image={image} />
      </ShaderContainer>
      <div onClick={handleClick} className="mx-auto mt-16 mb-48 w-fit text-base text-current/70 select-none">
        Click to change the sample image
      </div>
      <ShaderDetails shaderDef={imageDitheringDef} currentParams={params} />
    </>
  );
};

export default ImageDitheringWithControls;
