'use client';

import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { Voronoi, type VoronoiParams, voronoiPresets } from '@paper-design/shaders-react';
import { ShaderFitOptions, ShaderFit } from '@paper-design/shaders';
import { useControls, button, folder } from 'leva';
import Link from 'next/link';

/**
 * You can copy/paste this example to use Voronoi in your app
 */
const VoronoiExample = () => {
  return (
    <Voronoi
      colorCell1="#e64d1a"
      colorCell2="#1ae6e6"
      colorCell3="#1aa2e6"
      colorEdges="#000000"
      colorGradient={0}
      scale={1}
      distance={0.25}
      edgesSize={0.2}
      edgesSoftness={0}
      speed={1}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = voronoiPresets[0].params;

const VoronoiWithControls = () => {
  const [params, setParams] = useControls(() => {
    const presets = Object.fromEntries(
      voronoiPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => setParamsSafe(params, setParams, preset)),
      ])
    );
    return {
      Parameters: folder(
        {
          colorCell1: { value: defaults.colorCell1, order: 100 },
          colorCell2: { value: defaults.colorCell2, order: 101 },
          colorCell3: { value: defaults.colorCell3, order: 102 },
          colorMid: { value: defaults.colorMid, order: 103 },
          colorEdges: { value: defaults.colorEdges, order: 104 },
          colorGradient: { value: defaults.colorGradient, min: 0, max: 1, order: 105 },
          distance: { value: defaults.distance, min: 0, max: 0.5, order: 300 },
          edgesSize: { value: defaults.edgesSize, min: 0, max: 1, order: 301 },
          edgesSoftness: { value: defaults.edgesSoftness, min: 0, max: 1, order: 302 },
          middleSize: { value: defaults.middleSize, min: 0, max: 1, order: 303 },
          middleSoftness: { value: defaults.middleSoftness, min: 0, max: 1, order: 304 },
          speed: { value: defaults.speed, min: 0, max: 1, order: 400 },
        },
        { order: 1 }
      ),
      Transform: folder(
        {
          scale: { value: defaults.scale, min: 0.01, max: 4, order: 400 },
          rotation: { value: defaults.rotation, min: 0, max: 360, order: 401 },
          offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 402 },
          offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 403 },
        },
        {
          order: 2,
          collapsed: false,
        }
      ),
      Fit: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 404 },
          worldWidth: { value: 1000, min: 1, max: 5120, order: 405 },
          worldHeight: { value: 500, min: 1, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
      Presets: folder(presets, { order: 10 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(voronoiPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Voronoi className="fixed size-full" {...params} />
    </>
  );
};

export default VoronoiWithControls;
