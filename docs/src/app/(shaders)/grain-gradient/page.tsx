'use client';

import { GrainGradient, grainGradientPresets } from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { grainGradientMeta, GrainGradientShape, GrainGradientShapes, ShaderFitOptions } from '@paper-design/shaders';
import { ShaderFit } from '@paper-design/shaders';
import { useColors } from '@/helpers/use-colors';
import { toHsla } from '@/helpers/to-hsla';
import { ShaderContainer } from '@/components/shader-container';
import { ShaderDetails } from '@/components/shader-details';

/**
 * You can copy/paste this example to use GrainGradient in your app
 */
const GrainGradientExample = () => {
  return <GrainGradient style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const { worldWidth, worldHeight, ...defaults } = grainGradientPresets[0].params;

const GrainGradientWithControls = () => {
  const { colors, setColors } = useColors({
    defaultColors: defaults.colors,
    maxColorCount: grainGradientMeta.maxColorCount,
  });

  const [params, setParams] = useControls(() => {
    return {
      colorBack: { value: toHsla(defaults.colorBack), order: 100 },
      softness: { value: defaults.softness, min: 0, max: 1, order: 200 },
      intensity: { value: defaults.intensity, min: 0, max: 1, order: 201 },
      noise: { value: defaults.noise, min: 0, max: 1, order: 202 },
      shape: {
        value: defaults.shape,
        options: Object.keys(GrainGradientShapes) as GrainGradientShape[],
        order: 203,
      },
      offsetX: { value: defaults.offsetX, min: -1, max: 1, order: 300 },
      offsetY: { value: defaults.offsetY, min: -1, max: 1, order: 301 },
      scale: { value: defaults.scale, min: 0.01, max: 4, order: 302 },
      rotation: { value: defaults.rotation, min: 0, max: 360, order: 303 },
      speed: { value: defaults.speed, min: 0, max: 2, order: 400 },
    };
  }, [colors.length]);

  useControls(() => {
    const presets = Object.fromEntries(
      grainGradientPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
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
  usePresetHighlight(grainGradientPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <ShaderContainer>
        <GrainGradient {...params} colors={colors} />
      </ShaderContainer>
      <ShaderDetails
        name="Grain Gradient"
        currentParams={{ ...params, colors }}
        description="Multi-color gradient with noise & grain over animated abstract shapes."
        props={{
          'colorBack, colors': 'Colors used for the effect.',
          'softness': 'Blur between color bands.',
          'intensity': 'Distortion between color bands.',
          'noise': 'Grainy noise independent of softness.',
          'shape': (
            <>
              <ul className="list-disc pl-4 [&_b]:font-semibold">
                <li>
                  <b>wave</b>: Single sine wave.
                </li>
                <li>
                  <b>dots</b>: Dots pattern.
                </li>
                <li>
                  <b>truchet</b>: Truchet pattern.
                </li>
                <li>
                  <b>corners</b>: 2 rounded rectangles.
                </li>
                <li>
                  <b>ripple</b>: Ripple effect.
                </li>
                <li>
                  <b>blob</b>: Metaballs.
                </li>
                <li>
                  <b>sphere</b>: Circle imitating a 3D look.
                </li>
              </ul>
            </>
          ),
          'offsetX, offsetY': 'position of the center',
          'scale': 'overall pattern zoom',
          'rotation': 'overall pattern rotation angle',
          'speed': 'animation speed',
        }}
      />
    </>
  );
};

export default GrainGradientWithControls;
