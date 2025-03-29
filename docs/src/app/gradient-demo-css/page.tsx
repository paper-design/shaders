'use client';

import {
  GradientDemoCSS,
  type GradientDemoCSSParams,
  gradientDemoCSSPresets,
  gradientDemoCSSMaxColorCount,
} from '@paper-design/shaders-react';
import { useControls, button, folder } from 'leva';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';

/**
 * You can copy/paste this example to use GradientDemoCSS in your app
 */
const GradientDemoCSSExample = () => {
  return (
    <GradientDemoCSS
      colors={['#b3a6ce', '#562b9c', '#f4e8b8', '#c79acb']}
      speed={0.15}
      style={{ position: 'fixed', width: '100%', height: '100%' }}
    />
  );
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = gradientDemoCSSPresets[0].params;

const GradientDemoCSSWithControls = () => {
  const [{ colorCount }, setColorCount] = useControls(() => ({
    Colors: folder({
      colorCount: {
        value: defaults.colors.length,
        min: 2,
        max: gradientDemoCSSMaxColorCount,
        step: 1,
      },
    }),
  }));

  const [levaColors, setLevaColors] = useControls(() => {
    const colors: Record<string, { value: string }> = {};

    for (let i = 0; i < colorCount; i++) {
      colors[`color${i}`] = {
        value: defaults.colors[i] ?? 'hsla(' + Math.random() * 360 + ', 50%, 50%, 1)',
      };
    }

    return {
      Colors: folder(colors),
    };
  }, [colorCount]);

  const [params, setParams] = useControls(() => {
    const presets: GradientDemoCSSParams = Object.fromEntries(
      gradientDemoCSSPresets.map((preset) => {
        return [
          preset.name,
          button(() => {
            const { colors, ...presetParams } = preset.params;
            setParamsSafe(params, setParams, presetParams);
            setColorCount({ colorCount: colors.length });

            const presetColors = Object.fromEntries(
              colors.map((color, index) => {
                return [`color${index}`, color];
              })
            );

            setColorCount({ colorCount: colors.length });
            setParamsSafe(levaColors, setLevaColors, presetColors);
          }),
        ];
      })
    );

    return {
      Parameters: folder(
        {
          test: { value: defaults.test, min: 0, max: 9, step: 1, order: 400 },
        },
        { order: 1 }
      ),
      Presets: folder(presets as Record<string, string>, { order: 2 }),
    };
  }, [colorCount]);

  // Reset to defaults on mount, so that Leva doesn't show values from other
  // shaders when navigating (if two shaders have a color1 param for example)
  useResetLevaParams(params, setParams, defaults);
  usePresetHighlight(gradientDemoCSSPresets, params);
  cleanUpLevaParams(params);

  const colors = Object.values(levaColors) as unknown as string[];

  const getColorMixingFunction = () => {
    if (params.test == 0) {
      return (
        <>
          &nbsp;
          <br />
          mix(
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;color0,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;color1,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;coordinate
          <br />)
        </>
      );
    } else if (params.test == 1) {
      return (
        <>
          linearToSrgb(
          <br />
          &nbsp;&nbsp;mix(
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;srgbToLinear(color0),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;srgbToLinear(color1),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;coordinate
          <br />
          ))
        </>
      );
    } else if (params.test == 2) {
      return (
        <>
          srgbToLinear(
          <br />
          &nbsp;&nbsp;mix(
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;linearToSrgb(color0),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;linearToSrgb(color1),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;coordinate
          <br />
          ))
        </>
      );
    } else if (params.test == 3) {
      return (
        <>
          linearToSrgb(
          <br />
          &nbsp;&nbsp;mix(
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;color0,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;color1,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;coordinate
          <br />
          ))
        </>
      );
    } else if (params.test == 4) {
      return (
        <>
          srgbToLinear(
          <br />
          &nbsp;&nbsp;mix(
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;color0,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;color1,
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;coordinate
          <br />
          ))
        </>
      );
    } else if (params.test == 5) {
      return (
        <>
          &nbsp;
          <br />
          mix(
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;srgbToLinear(color0),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;srgbToLinear(color1),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;coordinate
          <br />)
        </>
      );
    } else if (params.test == 6) {
      return (
        <>
          &nbsp;
          <br />
          mix(
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;linearToSrgb(color0),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;linearToSrgb(color1),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;coordinate
          <br />)
        </>
      );
    } else if (params.test == 7) {
      return (
        <>
          oklabToLinear(
          <br />
          &nbsp;&nbsp;mix(
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;linearToOklab(color0),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;linearToOklab(color1),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;coordinate
          <br />
          ))
        </>
      );
    } else if (params.test == 8) {
      return (
        <>
          linearToSrgb(oklabToLinear(
          <br />
          &nbsp;&nbsp;mix(
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;linearToOklab(srgbToLinear(color0)),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;linearToOklab(srgbToLinear(color1)),
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;coordinate
          <br />
          ))
        </>
      );
    } else if (params.test == 9) {
      return <>https://www.shadertoy.com/view/ttcyRS</>;
    } else {
      return <></>;
    }
  };

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <div className="fixed flex size-full flex-col" style={{ width: 'calc(100% - 300px)' }}>
        <div className="relative h-1/3">
          <span className="absolute left-0 top-0 p-2 font-bold text-white">
            {`CSS: linear-gradient(to right in oklch, ${colors.join(', ')})`}
          </span>
          <div
            className="h-full"
            style={{
              background: `linear-gradient(to right in oklch, ${colors.join(', ')})`,
            }}
          />
        </div>

        <div className="relative h-1/3 w-full">
          <div className="top-half absolute left-0 whitespace-pre p-2 font-bold text-white">
            {getColorMixingFunction()}
          </div>
          <GradientDemoCSS {...params} colors={colors} className="h-full w-full" />
        </div>

        <div className="relative h-1/3">
          <span className="absolute left-0 top-0 p-2 font-bold text-white">{`CSS: linear-gradient(to right, ${colors.join(', ')})`}</span>
          <div
            className="h-full"
            style={{
              background: `linear-gradient(to right, ${colors.join(', ')})`,
            }}
          />
        </div>
      </div>
    </>
  );
};

export default GradientDemoCSSWithControls;
