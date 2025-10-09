'use client';

import { ImageLiquidMetal, imageLiquidMetalPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, Suspense } from 'react';
import { ShaderDetails } from '@/components/shader-details';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';
import { imageLiquidMetalDef } from '@/shader-defs/image-liquid-metal-def';

const { worldWidth, worldHeight, ...defaults } = imageLiquidMetalPresets[0].params;

const ImageLiquidMetalWithControls = () => {
  const [image, setImage] = useState<HTMLImageElement | string>('/images/logos-svg/apple.svg');

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      imageLiquidMetalPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      // edge: { value: defaults.edge, min: 0, max: 1, order: 200 },
      liquid: { value: defaults.liquid, min: 0, max: 1, order: 201 },
      patternBlur: { value: defaults.patternBlur, min: 0, max: 0.05, order: 202 },
      patternScale: { value: defaults.patternScale, min: 1, max: 10, order: 203 },
      refraction: { value: defaults.refraction, min: 0, max: 0.06, order: 204 },
      speed: { value: defaults.speed, min: 0, max: 4, order: 300 },
      scale: { value: defaults.scale, min: 0.5, max: 10, order: 301 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 302 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 303 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 304 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 305 },
      Image: folder({
        'Upload image': levaImageButton((img?: HTMLImageElement) => setImage(img ?? '')),
      }),
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  useUrlParams(params, setParams, imageLiquidMetalDef);
  usePresetHighlight(imageLiquidMetalPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={imageLiquidMetalDef} currentParams={params}>
        <Suspense fallback={null}>
          <ImageLiquidMetal {...params} image={image} suspendWhenProcessingImage />
        </Suspense>
      </ShaderContainer>
      <ShaderDetails shaderDef={imageLiquidMetalDef} currentParams={params} codeSampleImageName="diamond.webp" />
    </>
  );
};

export default ImageLiquidMetalWithControls;
