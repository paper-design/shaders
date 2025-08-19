'use client';

import { FlutedGlass, flutedGlassPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import {
  GlassGridShape,
  GlassGridShapes,
  GlassDistortionShape,
  GlassDistortionShapes,
  ShaderFitOptions,
} from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { levaImageButton } from '@/helpers/leva-image-button';
import { useState, useEffect, useCallback } from 'react';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = flutedGlassPresets[0].params;

const FlutedGlassWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState('Click to load an image');

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
  const fileName = imageIdx >= 0 ? imageFiles[imageIdx] : null;

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
    setImage(img);
    setImageIdx(-1);
    setStatus(``);
  }, []);

  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      flutedGlassPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Parameters: folder(
        {
          count: { value: defaults.count, min: 4, max: 200, step: 1, order: 100 },
          shape: {
            value: defaults.shape,
            options: Object.keys(GlassGridShapes) as GlassGridShape[],
            order: 101,
          },
          angle: { value: defaults.angle, min: 0, max: 180, order: 102 },
          distortionShape: {
            value: defaults.distortionShape,
            options: Object.keys(GlassDistortionShapes) as GlassDistortionShape[],
            order: 200,
          },
          distortion: { value: defaults.distortion, min: 0, max: 1, order: 201 },
          shift: { value: defaults.shift, min: -1, max: 1, order: 205 },
          blur: { value: defaults.blur, min: 0, max: 50, order: 251 },
          highlights: { value: defaults.highlights, min: 0, max: 1, order: 270 },
        },
        { order: 1 }
      ),
      Image: folder(
        {
          'Upload image': levaImageButton(setImageWithoutStatus),
        },
        { order: 0 }
      ),
      ImageControls: folder(
        {
          fit: { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 100 },
          scale: { value: defaults.scale, min: 0.5, max: 10, order: 101 },
          marginLeft: { value: defaults.marginLeft, min: 0, max: 1, order: 200 },
          marginRight: { value: defaults.marginRight, min: 0, max: 1, order: 201 },
          marginTop: { value: defaults.marginTop, min: 0, max: 1, order: 202 },
          marginBottom: { value: defaults.marginBottom, min: 0, max: 1, order: 203 },
          // rotation: {value: defaults.rotation, min: 0, max: 360, order: 401},
          // offsetX: {value: defaults.offsetX, min: -1, max: 1, order: 402},
          // offsetY: {value: defaults.offsetY, min: -1, max: 1, order: 403},
        },
        { order: 3 }
      ),

      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(flutedGlassPresets, params);
  cleanUpLevaParams(params);

  return (
    <div>
      <ShaderContainer>
        <FlutedGlass onClick={handleClick} {...params} image={image || undefined} />
      </ShaderContainer>
      <div onClick={handleClick} className="select-none py-3 text-center">
        Click to change sample image
      </div>
      <ShaderDetails name="Fluted Glass" currentParams={params} />
    </div>
  );
};

export default FlutedGlassWithControls;
