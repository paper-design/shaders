'use client';

import { MeshGradient, meshGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { meshGradientMeta, ShaderFit, ShaderFitOptions } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * You can copy/paste this example to use MeshGradient in your app
 */
const MeshGradientExample = () => {
  return <MeshGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = meshGradientPresets[0].params;

const MeshGradientWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: meshGradientMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 200 },
      swirl: { value: defaults.swirl, min: 0, max: 1, order: 201 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      meshGradientPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { colors, ...presetParams } = preset;
          setColors(colors);
          setParamsSafe(params, setParams, presetParams);
        }),
      ])
    );
    return {
      Presets: folder(presets, { order: -1 }),
    };
  });

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(meshGradientPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <MeshGradient {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails
        name="Mesh Gradient"
        currentParams={{ ...params, colors }}
        props={{
          'distortion': 'Warp distortion.',
          'swirl': 'Vortex distortion.',
          'offsetX, offsetY': 'Position of the center.',
          'scale': 'Overall pattern zoom.',
          'rotation': 'Overall pattern rotation angle.',
          'speed': 'Animation speed.',
        }}
        description="A composition of N color spots (one per color) with 2 types of distortions applied to the coordinate space."
      />
    </>
  );
};

export default MeshGradientWithControls;
