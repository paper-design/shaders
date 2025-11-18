'use client';

import { FlutedGlass, flutedGlassPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { GlassGridShape, GlassGridShapes, GlassDistortionShape, GlassDistortionShapes } from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/color-utils';
import { ShaderDetails } from '@/components/shader-details';
import { flutedGlassDef } from '@/shader-defs/fluted-glass-def';
import { ShaderContainer } from '@/components/shader-container';
import { useUrlParams } from '@/helpers/use-url-params';

const { worldWidth, worldHeight, ...defaults } = flutedGlassPresets[0].params;

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

const FlutedGlassWithControls = () => {
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
      flutedGlassPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorShadow: { value: toHsla(defaults.colorShadow), order: 101 },
      colorHighlight: { value: toHsla(defaults.colorHighlight), order: 102 },
      size: { value: defaults.size, min: 0.01, max: 1, step: 0.01, order: 210 },
      shadows: { value: defaults.shadows, min: 0, max: 1, order: 200 },
      highlights: { value: defaults.highlights, min: 0, max: 1, order: 201 },
      shape: {
        value: defaults.shape,
        options: Object.keys(GlassGridShapes) as GlassGridShape[],
        order: 211,
      },
      angle: { value: defaults.angle, min: 0, max: 180, order: 212 },
      distortionShape: {
        value: defaults.distortionShape,
        options: Object.keys(GlassDistortionShapes) as GlassDistortionShape[],
        order: 213,
      },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 214 },
      shift: { value: defaults.shift, min: -1, max: 1, order: 215 },
      stretch: { value: defaults.stretch, min: 0, max: 1, order: 216 },
      blur: { value: defaults.blur, min: 0, max: 1, order: 220 },
      edges: { value: defaults.edges, min: 0, max: 1, order: 221 },
      margin: { value: defaults.margin, min: 0, max: 0.5, order: 500 },
      // marginLeft: { value: defaults.marginLeft, min: 0, max: 1, order: 501 },
      // marginRight: { value: defaults.marginRight, min: 0, max: 1, order: 502 },
      // marginTop: { value: defaults.marginTop, min: 0, max: 1, order: 503 },
      // marginBottom: { value: defaults.marginBottom, min: 0, max: 1, order: 504 },
      grainMixer: { value: defaults.grainMixer, min: 0, max: 1, order: 550 },
      grainOverlay: { value: defaults.grainOverlay, min: 0, max: 1, order: 551 },
      scale: { value: defaults.scale, min: 0.5, max: 4, order: 600 },
      // rotation: { value: defaults.rotation, min: 0, max: 360, order: 601 },
      // offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 602 },
      // offsetY: { value: defaults.offsetX, min: -1, max: 1, order: 603 },
      fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 604 },

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
  useUrlParams(params, setParams, flutedGlassDef);
  usePresetHighlight(flutedGlassPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer shaderDef={flutedGlassDef} currentParams={params}>
        <FlutedGlass onClick={handleClick} {...params} image={image} />
      </ShaderContainer>

      <div onClick={handleClick} className="text-current/70 mx-auto mb-48 mt-16 w-fit select-none text-base">
        Click to change the sample image
      </div>

      <ShaderDetails shaderDef={flutedGlassDef} currentParams={params} />
    </>
  );
};

export default FlutedGlassWithControls;
