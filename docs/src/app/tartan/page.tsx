'use client';

import { BackButton } from '@/components/back-button';
import { cleanUpLevaParams } from '@/helpers/clean-up-leva-params';
import { toHsla } from '@/helpers/to-hsla';
import { usePresetHighlight } from '@/helpers/use-preset-highlight';
import { setParamsSafe, useResetLevaParams } from '@/helpers/use-reset-leva-params';
import { type ShaderFit, ShaderFitOptions, tartanMeta } from '@paper-design/shaders';
import { Tartan, tartanPresets } from '@paper-design/shaders-react';
import { button, folder, useControls } from 'leva';
import Link from 'next/link';

/**
 * You can copy/paste this example to use Tartan in your app
 */
const TartanExample = () => {
  return <Tartan style={{ position: 'fixed', width: '100%', height: '100%' }} />;
};

/**
 * This example has controls added so you can play with settings in the example app
 */

const defaults = tartanPresets[0].params;

const TartanWithControls = () => {
  const [{ count: stripeCount }, setStripeCount] = useControls(() => ({
    Stripes: folder(
      {
        count: {
          value: defaults.stripeColors.length,
          min: 2,
          max: tartanMeta.maxStripeCount,
          step: 1,
          order: 0,
        },
      },
      { order: 1 }
    ),
  }));

  const [colors, setColors] = useControls(() => {
    const stripe: Record<string, { value: string; [key: string]: unknown }> = {};

    for (let i = 0; i < stripeCount; i++) {
      stripe[`color${i + 1}`] = {
        value: defaults.stripeColors[i] ? toHsla(defaults.stripeColors[i]) : `hsla(${(40 * i) % 360}, 60%, 50%, 1)`,
        order: 1 + i * 2,
      };
    }

    return {
      Stripes: folder(stripe),
    };
  }, [stripeCount]);

  const [widths, setWidths] = useControls(() => {
    const stripe: Record<string, { value: number; [key: string]: unknown }> = {};

    for (let i = 0; i < stripeCount; i++) {
      stripe[`width${i + 1}`] = {
        value: defaults.stripeWidths[i],
        min: 1,
        max: 400,
        step: 1,
        order: 1 + i * 2 + 1,
      };
    }

    return {
      Stripes: folder(stripe),
    };
  }, [stripeCount]);

  const [params, setParams] = useControls(() => {
    return {
      Parameters: folder(
        {
          weaveSize: {
            value: defaults.weaveSize,
            min: 1.0,
            max: 10.0,
            step: 0.25,
            order: 0,
          },
          weaveStrength: {
            value: defaults.weaveStrength,
            min: 0.0,
            max: 1.0,
            step: 0.05,
            order: 1,
          },
        },
        {
          order: 0,
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
          order: 2,
          collapsed: false,
        }
      ),
      Fit: folder(
        {
          fit: { value: defaults.fit, options: Object.keys(ShaderFitOptions) as ShaderFit[], order: 404 },
          worldWidth: { value: 1000, min: 0, max: 5120, order: 405 },
          worldHeight: { value: 500, min: 0, max: 5120, order: 406 },
          originX: { value: defaults.originX, min: 0, max: 1, order: 407 },
          originY: { value: defaults.originY, min: 0, max: 1, order: 408 },
        },
        {
          order: 3,
          collapsed: true,
        }
      ),
    };
  });

  useControls(() => {
    const presets = Object.fromEntries(
      tartanPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
        name,
        button(() => {
          const { stripeColors, stripeWidths, ...presetParams } = preset;
          setStripeCount({ count: stripeColors.length });
          setColors(
            Object.fromEntries(stripeColors.map((value, i) => [`color${i + 1}`, toHsla(value)])) as unknown as Record<
              string,
              { value: string; [key: string]: unknown }
            >
          );
          setWidths(Object.fromEntries(stripeWidths.map((value, i) => [`width${i + 1}`, value])));
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
  usePresetHighlight(tartanPresets, params);
  cleanUpLevaParams(params);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Tartan
        {...params}
        stripeColors={Object.values(colors) as unknown as Array<string>}
        stripeWidths={[...Object.values(widths), ...Array(9 - stripeCount).fill(0)]}
        className="fixed size-full"
      />
    </>
  );
};

export default TartanWithControls;
