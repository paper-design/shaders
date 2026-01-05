'use client';

import { Folds, foldsPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { foldsMeta } from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, Suspense, useEffect, useCallback } from 'react';
import { ShaderDetails } from '@/components/shader-details';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { foldsDef } from '@/shader-defs/folds-def';
import { toHsla } from '@/helpers/color-utils';
import { useColors } from "@/helpers/use-colors";

// Override just for the docs, we keep it transparent in the preset
// foldsPresets[0].params.colorBack = '#000000';

const { worldWidth, worldHeight, ...defaults } = foldsPresets[0].params;

const imageFiles = [
  'contra.svg',
  'apple.svg',
  'paradigm.svg',
  'paper-logo-only.svg',
  'brave.svg',
  'capy.svg',
  'infinite.svg',
  'linear.svg',
  'mercury.svg',
  'mymind.svg',
  'resend.svg',
  'shopify.svg',
  'wealth-simple.svg',
  'chanel.svg',
  'cibc.svg',
  'cloudflare.svg',
  'discord.svg',
  'nasa.svg',
  'nike.svg',
  'volkswagen.svg',
  'diamond.svg',
] as const;

const FoldsWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | string>('/images/logos/diamond.svg');

  useEffect(() => {
    if (imageIdx >= 0) {
      const name = imageFiles[imageIdx];
      const img = new Image();
      img.src = `/images/logos/${name}`;
      img.onload = () => setImage(img);
    }
  }, [imageIdx]);

  const handleClick = useCallback(() => {
    setImageIdx((prev) => (prev + 1) % imageFiles.length);
    // setImageIdx(() => Math.floor(Math.random() * imageFiles.length));
  }, []);

  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: foldsMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      strokeWidth: { value: defaults.strokeWidth, min: 0, max: 1, order: 200 },
      outline: { value: defaults.outline, min: 0, max: 1, order: 200 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 201 },
      size: { value: defaults.size, min: 0.01, max: 1, order: 203 },
      shift: { value: defaults.shift, min: -0.5, max: 0.5, order: 204 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 205 },
      contourNoise: { value: defaults.contourNoise, min: 0, max: 1, order: 205 },
      noiseScale: { value: defaults.noiseScale, min: .01, max: 3, step: 0.01, order: 206 },
      angle: { value: defaults.angle, min: 0, max: 360, order: 208 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 300 },
      scale: { value: defaults.scale, min: 0.2, max: 10, order: 301 },
      // rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      // offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      // offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
      // fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 305 },
      Image: folder(
        {
          'Upload image': levaImageButton((img?: HTMLImageElement) => setImage(img ?? '')),
        },
        { order: -1 }
      ),
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      foldsPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  useUrlParams(params, setParams, foldsDef, setColors);
  usePresetHighlight(foldsPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={foldsDef} currentParams={params}>
        <Suspense fallback={null}>
          <Folds onClick={handleClick} {...params} colors={ colors } image={image} suspendWhenProcessingImage />
        </Suspense>
      </ShaderContainer>
      <ShaderDetails shaderDef={foldsDef} currentParams={ {colors, ...params} } codeSampleImageName="images/logos/diamond.svg" />
    </>
  );
};

export default FoldsWithControls;
