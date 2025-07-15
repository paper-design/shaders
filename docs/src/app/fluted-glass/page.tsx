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
  const [imageIdx, setImageIdx] = useState(0);

  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const imageFiles = [
    '01.png',
    '02.jpg',
    '04.png',
    '05.jpg',
    '06.jpg',
    '07.webp',
    '08.png',
    '010.png',
    '011.png',
    '012.png',
    '013.png',
    '014.png',
    '015.png',
    '016.jpg',
  ] as const;

  useEffect(() => {
    const img = new Image();
    img.src = `/images/${imageFiles[imageIdx]}`;
    img.onload = () => {
      setImage(img);
    };
  }, [imageIdx]);

  const handleClick = useCallback(() => {
    setImageIdx((prev) => (prev + 1) % imageFiles.length);
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
          grid: { value: defaults.grid, min: 4, max: 100, step: 1, order: 100 },
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
          skew: { value: defaults.skew, min: 0, max: 1, order: 206 },
          frost: { value: defaults.frost, min: 0, max: 1, order: 250 },
          blur: { value: defaults.blur, min: 0, max: 25, order: 251 },
          gridLines: { value: defaults.gridLines, min: 0, max: 1, order: 270 },
          gridLinesBrightness: { value: defaults.gridLinesBrightness, min: 0, max: 1, order: 271 },
        },
        { order: 1 }
      ),
      FilterArea: folder(
        {
          marginLeft: { value: defaults.marginLeft, min: 0, max: 1, order: 100 },
          marginRight: { value: defaults.marginRight, min: 0, max: 1, order: 101 },
          marginTop: { value: defaults.marginTop, min: 0, max: 1, order: 102 },
          marginBottom: { value: defaults.marginBottom, min: 0, max: 1, order: 103 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 400 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 402 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 403 },
        },
        {
          order: 4,
          collapsed: true,
        }
      ),
      Fit: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 404 },
          worldWidth: { value: 0, min: 0, max: 5120, order: 405 },
          worldHeight: { value: 0, min: 0, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 5,
          collapsed: true,
        }
      ),
      Image: folder(
        {
          'Upload image': levaImageButton(setImage),
        },
        {
          order: 3,
          collapsed: false,
        }
      ),

      Presets: folder(presets, { order: 10 }),
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
      <FlutedGlass className="fixed size-full" onClick={ handleClick } { ...params } image={ image || undefined }/>
    </>
  );
};

export default FlutedGlassWithControls;
