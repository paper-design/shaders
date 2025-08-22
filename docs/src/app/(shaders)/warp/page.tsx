'use client';

import { Warp, WarpPattern, warpPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { warpMeta, ShaderFit, ShaderFitOptions, WarpPatterns } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * You can copy/paste this example to use Warp in your app
 */
const WarpExample = () => {
  return <Warp style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = warpPresets[0].params;

const WarpWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: warpMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      proportion: { value: defaults.proportion, min: 0, max: 1, order: 100 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 101 },
      distortion: { value: defaults.distortion, min: 0, max: 1, order: 102 },
      swirl: { value: defaults.swirl, min: 0, max: 1, order: 103 },
      swirlIterations: { value: defaults.swirlIterations, min: 0, max: 20, order: 104 },
      shape: { value: defaults.shape, options: Object.keys(WarpPatterns) as WarpPattern[], order: 105 },
      shapeScale: { value: defaults.shapeScale, min: 0, max: 1, order: 106 },
      scale: { value: defaults.scale, min: 0.01, max: 5, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 20, order: 400 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      warpPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  usePresetHighlight(warpPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <Warp {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails
        name="Warp"
        currentParams={{ ...params, colors }}
        description="Animated color fields warped by noise and swirls, applied over base patterns (checks, stripes, or split edge). Blends up to 10 colors with adjustable distribution, softness, distortion, and swirl. Great for fluid, smoky, or marbled effects"
        props={{
          colors: 'up to 10 RGBA colors in the gradient',
          proportion: 'balance point for blending colors',
          softness: 'smoothness of color transitions (0 = hard edge, 1 = soft blend)',
          distortion: 'strength of noise-based distortion',
          swirl: 'strength of the swirl distortion',
          swirlIterations: 'number of layered swirl passes',
          shape: (
            <>
              base pattern type
              <ul className="list-disc pl-4 [&_b]:font-semibold">
                <li>
                  <b>checks</b>: checkerboard
                </li>
                <li>
                  <b>stripes</b>: even stripes
                </li>
                <li>
                  <b>edge</b>: two halves split across the canvas
                </li>
              </ul>
            </>
          ),
          shapeScale: 'zoom level of the base pattern',
          scale: 'overall pattern zoom',
          rotation: 'overall pattern rotation angle',
          speed: 'animation speed',
        }}
      />
    </>
  );
};

export default WarpWithControls;
