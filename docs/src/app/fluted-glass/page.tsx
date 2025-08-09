'use client';

import { FlutedGlass, flutedGlassPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
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

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = flutedGlassPresets[0].params;

const FlutedGlassWithControls = () => {
  const [imageIdx, setImageIdx] = useState(-1);
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  const [status, setStatus] = useState('Click to load an image');

  const imageFiles = [
    '075.jpg',
    '072.jpg',
    '030.jpg',
    '074.jpg',
    '068.jpg',
    '070.jpg',
    '083.jpg',
    '049.jpg',
    '059.jpg',
    '060.jpg',
    '031.jpg',
    '032.jpg',
    '034.jpg',
    '006.jpg',
    '082.jpg',
    '037.jpg',
    '028.jpg',
    '038.jpg',
    '088.jpg',
    '039.jpg',
    '047.jpg',
    '048.jpg',
  ] as const;

  const fileName = imageIdx >= 0 ? imageFiles[imageIdx] : null;

  useEffect(() => {
    if (imageIdx >= 0) {
      const name = imageFiles[imageIdx];
      setStatus(`Displaying image: ${name}`);
      const img = new Image();
      img.src = `/images/${name}`;
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
          grid: { value: defaults.grid, min: 4, max: 200, step: 1, order: 100 },
          gridShape: {
            value: defaults.gridShape,
            options: Object.keys(GlassGridShapes) as GlassGridShape[],
            order: 101,
          },
          gridRotation: { value: defaults.gridRotation, min: 0, max: 180, order: 102 },
          distortionShape: {
            value: defaults.distortionShape,
            options: Object.keys(GlassDistortionShapes) as GlassDistortionShape[],
            order: 200,
          },
          distortion: { value: defaults.distortion, min: 0, max: 1, order: 201 },
          shift: { value: defaults.shift, min: -1, max: 1, order: 205 },
          frost: { value: defaults.frost, min: 0, max: 1, order: 250 },
          blur: { value: defaults.blur, min: 0, max: 25, order: 251 },
          gridLines: { value: defaults.gridLines, min: 0, max: 1, order: 270 },
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
          'fit': { value: defaults.fit, options: ['contain', 'cover'] as ShaderFit[], order: 100 },
          'scale': { value: defaults.scale, min: 1, max: 4, order: 101 },
          'marginLeft': { value: defaults.marginLeft, min: 0, max: 1, order: 200 },
          'marginRight': { value: defaults.marginRight, min: 0, max: 1, order: 201 },
          'marginTop': { value: defaults.marginTop, min: 0, max: 1, order: 202 },
          'marginBottom': { value: defaults.marginBottom, min: 0, max: 1, order: 203 },
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
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <FlutedGlass className="fixed size-full" onClick={handleClick} {...params} image={image || undefined} />
      <div
        className="fixed bottom-3 left-3 rounded px-2 py-1 text-xs"
        style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}
      >
        {fileName ? `Displaying image: ${fileName}` : 'Click to load an image'}
      </div>
    </>
  );
};

export default FlutedGlassWithControls;
