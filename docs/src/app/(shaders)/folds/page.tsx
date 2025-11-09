'use client';

import { Folds, foldsPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { FoldsShapes, FoldsShape } from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { levaDeleteImageButton, levaImageButton } from '@/helpers/leva-image-button';
import { useState, Suspense } from 'react';
import { ShaderDetails } from '@/components/shader-details';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { foldsDef } from '@/shader-defs/folds-def';
import { toHsla } from '@/helpers/color-utils';

// Override just for the docs, we keep it transparent in the preset
// foldsPresets[0].params.colorBack = '#000000';

const { worldWidth, worldHeight, ...defaults } = foldsPresets[0].params;

const FoldsWithControls = () => {
  const [image, setImage] = useState<HTMLImageElement | string>('/images/logos/apple.svg');

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      foldsPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorFront: { value: toHsla(defaults.colorFront), order: 101 },
      // shape: {
      //   value: defaults.shape,
      //   options: Object.keys(FoldsShapes) as FoldsShape[],
      //   order: 102,
      //   disabled: Boolean(image),
      // },
      // repetition: { value: defaults.repetition, min: 1, max: 10, order: 200 },
      // softness: { value: defaults.softness, min: 0, max: 1, order: 201 },
      // shiftRed: { value: defaults.shiftRed, min: -1, max: 1, order: 202 },
      // shiftBlue: { value: defaults.shiftBlue, min: -1, max: 1, order: 203 },
      // distortion: { value: defaults.distortion, min: 0, max: 1, order: 204 },
      // contour: { value: defaults.contour, min: 0, max: 1, order: 205 },
      // angle: { value: defaults.angle, min: 0, max: 360, order: 206 },
      speed: { value: defaults.speed, min: 0, max: 4, order: 300 },
      scale: { value: defaults.scale, min: 0.2, max: 4, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 305 },
      Image: folder({
        'Upload image': levaImageButton((img?: HTMLImageElement) => setImage(img ?? '')),
        ...(image && { 'Delete image': levaDeleteImageButton(() => setImage('')) }),
      }),
      Presets: folder(presets, { order: -1 }),
    };
  }, [image]);

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, foldsDef);
  usePresetHighlight(foldsPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={foldsDef} currentParams={params}>
        <Suspense fallback={null}>
          <Folds {...params} image={image} suspendWhenProcessingImage />
        </Suspense>
      </ShaderContainer>
      <ShaderDetails shaderDef={foldsDef} currentParams={params} codeSampleImageName="images/logos/diamond.svg" />
    </>
  );
};

export default FoldsWithControls;
