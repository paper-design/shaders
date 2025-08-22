'use client';

import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { GodRays, godRaysPresets } from '@paper-design/shaders-react';
import { ShaderFitOptions, ShaderFit, metaballsMeta, godRaysMeta } from '@paper-design/shaders';
import { useControls, button, folder } from 'leva';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * You can copy/paste this example to use GodRays in your app
 */
const GodRaysExample = () => {
  return <GodRays style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = godRaysPresets[0].params;

const GodRaysWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: godRaysMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      colorBloom: { value: toHsla(defaults.colorBloom), order: 101 },
      bloom: { value: defaults.bloom, min: 0, max: 1, order: 200 },
      intensity: { value: defaults.intensity, min: 0, max: 1, order: 201 },
      density: { value: defaults.density, min: 0, max: 1, order: 204 },
      spotty: { value: defaults.spotty, min: 0, max: 1, order: 205 },
      midSize: { value: defaults.midSize, min: 0, max: 1, order: 206 },
      midIntensity: { value: defaults.midIntensity, min: 0, max: 1, order: 207 },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      godRaysPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  usePresetHighlight(godRaysPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <GodRays {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails
        name="God Rays"
        currentParams={{ ...params, colors }}
        description="Animated rays of light radiating from the center, blended with up to 5 colors. Adjustable for size, density, brightness, center glow. Great for dramatic backgrounds, logo reveals, and VFX like energy bursts or sun shafts"
        props={{
          'colors': 'Up to 5 ray colors.',
          'colorBack': 'Background color.',
          'colorBloom': 'Color overlay blended with the rays.',
          'bloom': 'Strength of the bloom/overlay effect.',
          'density': 'Frequency of rays around the circle.',
          'intensity': 'Visibility/strength of the rays.',
          'spotty': 'Density of spot patterns along the rays.',
          'midSize': 'Size of the circular glow in the center.',
          'midIntensity': 'Brightness of the central glow.',
          'offsetX, offsetY': 'Position of the center.',
          'scale': 'Overall pattern zoom.',
          'rotation': 'Overall pattern rotation angle.',
          'speed': 'Animation speed.',
        }}
      />
    </>
  );
};

export default GodRaysWithControls;
