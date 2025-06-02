'use client';

import { FlutedGlass, flutedGlassPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { GlassDistortion, GlassDistortionTypes, ShaderFitOptions } from '@paper-design/shaders';
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
    '023.jpg',
    '01.png',
    '07.jpg',
    '09.jpg',
    '010.jpg',
    '011.jpg',
    '012.jpg',
    '013.jpg',
    '014.png',
    '015.jpg',
    '017.png',
    '018.png',
    '019.webp',
    '020.jpeg',
    '021.png',
    '022.png',
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
          gridRotation: { value: defaults.gridRotation, min: 0, max: 180, order: 101 },
          distortion: { value: defaults.distortion, min: 0, max: 1, order: 200 },
          distortionType: {
            value: defaults.distortionType,
            options: Object.keys(GlassDistortionTypes) as GlassDistortion[],
            order: 201,
          },
          xShift: { value: defaults.xShift, min: -1, max: 1, order: 205 },
          frost: { value: defaults.frost, min: 0, max: 1, order: 250 },
          blur: { value: defaults.blur, min: 0, max: 15, order: 251 },
          gridLines: { value: defaults.gridLines, min: 0, max: 1, order: 270 },
          gridLinesBrightness: { value: defaults.gridLinesBrightness, min: 0, max: 1, order: 271 },
          extraLeft: { value: defaults.extraLeft, min: 0, max: 1, order: 300 },
          extraLeftDirection: { value: defaults.extraLeftDirection, min: -0.5, max: 0.5, order: 301 },
          extraRight: { value: defaults.extraRight, min: 0, max: 1, order: 302 },
          extraRightDirection: { value: defaults.extraRightDirection, min: -0.5, max: 0.5, order: 303 },
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

  if (image === null) {
    return null;
  }

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <FlutedGlass className="fixed size-full" onClick={handleClick} {...params} />
    </>
  );
};

export default FlutedGlassWithControls;
