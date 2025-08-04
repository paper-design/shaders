'use client';

import { BackButton } from '@/components/back-button';
import { createNumberedObject } from '@/helpers/create-numbered-object';
import { getValuesSortedByKey } from '@/helpers/get-values-sorted-by-key';
import { type ShaderFit, ShaderFitOptions, tartanMeta } from '@paper-design/shaders';
import { Tartan, tartanPresets } from '@paper-design/shaders-react';
import { button, folder, levaStore, useControls } from 'leva';
import type { Schema } from 'leva/dist/declarations/src/types';
import Link from 'next/link';
import { useEffect } from 'react';

const defaults = tartanPresets[0].params;

/**
 * This example has controls added so you can play with settings in the example app
 */
const TartanWithControls = () => {
  // Presets
  useControls({
    Presets: folder(
      Object.fromEntries(
        tartanPresets.map(({ name, params: { worldWidth, worldHeight, ...preset } }) => [
          name,
          button(() => {
            const { stripeColors, stripeWidths, ...presetParams } = preset;
            setParams(presetParams);
            setColors(
              createNumberedObject('color', tartanMeta.maxStripeCount, (i) => stripeColors[i % stripeColors.length])
            );
            setWidths(
              createNumberedObject('width', tartanMeta.maxStripeCount, (i) => stripeWidths[i % stripeWidths.length])
            );
          }),
        ])
      ),
      {
        order: -1,
        collapsed: false,
      }
    ),
  });

  // Scalar parameters
  const [params, setParams] = useControls(() => ({
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
    Stripes: folder(
      {
        stripeCount: {
          value: defaults.stripeCount,
          min: 2,
          max: tartanMeta.maxStripeCount,
          step: 1,
          order: 0,
          label: 'count',
        },
      },
      {
        order: 1,
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
  }));

  // Stripe colors
  const [colors, setColors] = useControls(
    () => ({
      Stripes: folder({
        ...createNumberedObject(
          'color',
          tartanMeta.maxStripeCount,
          (i) =>
            ({
              label: `color${i + 1}`,
              order: i * 2 + 1,
              render: () => params.stripeCount > i,
              value: defaults.stripeColors[i % defaults.stripeColors.length],
            }) satisfies Schema[string]
        ),
      }),
    }),
    [params.stripeCount]
  );

  // Stripe widths
  const [widths, setWidths] = useControls(
    () => ({
      Stripes: folder({
        ...createNumberedObject(
          'width',
          tartanMeta.maxStripeCount,
          (i) =>
            ({
              label: `width${i + 1}`,
              max: 100,
              min: 1,
              order: i * 2 + 2,
              render: () => params.stripeCount > i,
              step: 1,
              value: defaults.stripeWidths[i % defaults.stripeWidths.length],
            }) satisfies Schema[string]
        ),
      }),
    }),
    [params.stripeCount]
  );

  // Clear the Leva store when the component unmounts.
  useEffect(() => {
    return () => {
      levaStore.dispose();
    };
  }, []);

  return (
    <>
      <Link href="/">
        <BackButton />
      </Link>
      <Tartan
        {...params}
        stripeColors={getValuesSortedByKey(colors)}
        stripeWidths={getValuesSortedByKey(widths)}
        className="fixed size-full"
      />
    </>
  );
};

export default TartanWithControls;
