'use client';

import { Fragment, useState } from 'react';
import { PaperTexture, paperTexturePresets } from '@paper-design/shaders-react';
import { OldPaperTexture, oldDefaultParams, type OldParams } from './old-paper-texture';

const image = '/images/image-filters/0018.webp';

type Row = { legacy: string; before: string; after: string; note: string; todo: string; toCheck: boolean };

const rows: Row[] = [
  {
    legacy: '—',
    before: 'colorFront',
    after: 'colorShadow',
    note: '',
    todo: 'take as colorShadow',
    toCheck: false,
  },
  {
    legacy: '—',
    before: 'colorBack',
    after: 'colorBack',
    note: 'now less visible',
    todo: 'take as colorBack (nothing to remap)',
    toCheck: false,
  },
  {
    legacy: '—',
    before: '—',
    after: 'colorPaper',
    note: 'kinda what colorBack was',
    todo: 'take as colorPaper (so colorPaper and colorBack are same)',
    toCheck: false,
  },
  {
    legacy: '—',
    before: 'contrast',
    after: '—',
    note: 'removed (pattern strength now comes from the pattern amounts, colorShadow + you can say from blending)',
    todo: 'probably taking as a multiplier for all 4 pattern components? should affect the blending too. ',
    toCheck: true,
  },
  {
    legacy: 'blur',
    before: 'fade',
    after: '—',
    note: 'removed, no replacement',
    todo: 'ignore',
    toCheck: false,
  },
  {
    legacy: '—',
    before: 'image',
    after: 'image',
    note: '',
    todo: '',
    toCheck: false,
  },
  {
    legacy: '—',
    before: '—',
    after: 'blending',
    note: 'new (we were always blending the picture in)',
    todo: 'set to 1 (1 is a Default value, check if its visually better to remap to the smaller value)',
    toCheck: true,
  },
  {
    legacy: '—',
    before: '—',
    after: 'distortion',
    note: 'new (we were always distorting the pic)',
    todo: 'set to 0.75 (1 is a Default value, check if its visually better to remap to another value)',
    toCheck: true,
  },
  {
    legacy: '—',
    before: '—',
    after: 'clip',
    note: 'new',
    todo: 'set to false',
    toCheck: false,
  },
  {
    legacy: '—',
    before: '—',
    after: 'angle',
    note: 'new',
    todo: 'set to 300 (like in the Default preset)',
    toCheck: false,
  },
  {
    legacy: '—',
    before: 'seed',
    after: 'seed',
    note: 'same prop, rebuilt',
    todo: 'nothing we can do as its not possible to match the old seed visually; we just keep the given value and hope it looks nice',
    toCheck: false,
  },
  {
    legacy: '—',
    before: 'roughness',
    after: 'roughness',
    note: 'same prop, rebuilt',
    todo: 'probably keeping the same number - check if should be adjusted',
    toCheck: true,
  },
  {
    legacy: '—',
    before: '—',
    after: 'roughnessSize',
    note: 'new',
    todo: 'set to 0.5 (like in the Default preset) - check if should be adjusted',
    toCheck: true,
  },
  {
    legacy: '—',
    before: '—',
    after: 'roughnessRows',
    note: 'new',
    todo: 'set to 0',
    toCheck: false,
  },
  {
    legacy: '—',
    before: 'fiber',
    after: 'fiber',
    note: 'same prop, rebuilt',
    todo: 'probably doing x0.5 for the number? coefficient to double toCheck',
    toCheck: true,
  },
  {
    legacy: 'fiberScale',
    before: 'fiberSize',
    after: 'fiberSize',
    note: 'different mapping',
    todo: 'coefficient to find out',
    toCheck: true,
  },
  {
    legacy: '—',
    before: '—',
    after: 'folds',
    note: 'same prop name was used differently (old folds renamed to wrinkles, new folds are straight lines we never had)',
    todo: 'set to 0',
    toCheck: false,
  },
  {
    legacy: '—',
    before: '—',
    after: 'foldSizeX',
    note: 'new',
    todo: 'take a number from Default preset (doesnt matter)',
    toCheck: false,
  },
  {
    legacy: '—',
    before: '—',
    after: 'foldSizeY',
    note: 'new',
    todo: 'take a number from Default preset (doesnt matter)',
    toCheck: false,
  },
  {
    legacy: '—',
    before: '—',
    after: 'foldOffsetX',
    note: 'new',
    todo: 'take a number from Default preset (doesnt matter)',
    toCheck: false,
  },
  {
    legacy: '—',
    before: '—',
    after: 'foldOffsetY',
    note: 'new',
    todo: 'take a number from Default preset (doesnt matter)',
    toCheck: false,
  },
  {
    legacy: '—',
    before: 'crumples',
    after: 'wrinkles',
    note: 'its a different pattern close enough to port directly',
    todo: 'same value? to toCheck',
    toCheck: true,
  },
  {
    legacy: 'crumplesScale',
    before: 'crumpleSize',
    after: 'wrinkleSize',
    note: '',
    todo: 'to toCheck',
    toCheck: true,
  },
  {
    legacy: '—',
    before: 'folds',
    after: 'crumples',
    note: 'similar thing renamed (both shape and randomizer are different but principle is same)',
    todo: 'same value? to toCheck',
    toCheck: true,
  },
  {
    legacy: 'foldsNumber',
    before: 'foldCount',
    after: 'crumpleCount',
    note: '',
    todo: 'check if max limit was changed; might need clapping but nothing else',
    toCheck: true,
  },
  {
    legacy: '—',
    before: 'drops',
    after: 'drops',
    note: 'same drops, just different randomizer and different color usage',
    todo: 'might need remapping, might be same number',
    toCheck: true,
  },
  {
    legacy: '—',
    before: 'fit / scale defaults',
    after: 'fit / scale defaults',
    note: 'defaults changed',
    todo: 'need to cover the cases where fit or scale were not specified',
    toCheck: true,
  },
];

/** randomMin / randomMax narrow what randomize() picks without narrowing the slider itself */
type Slider = { name: string; min: number; max: number; step: number; randomMin?: number; randomMax?: number };

const sliders: Slider[] = [
  { name: 'contrast', min: 0, max: 1, step: 0.01 },
  { name: 'roughness', min: 0, max: 1, step: 0.01 },
  { name: 'fiber', min: 0, max: 1, step: 0.01 },
  { name: 'fiberSize', min: 0.01, max: 1, step: 0.01 },
  { name: 'crumples', min: 0, max: 1, step: 0.01 },
  { name: 'crumpleSize', min: 0.01, max: 1, step: 0.01 },
  { name: 'folds', min: 0, max: 1, step: 0.01 },
  { name: 'foldCount', min: 1, max: 15, step: 1 },
  { name: 'fade', min: 0, max: 1, step: 0.01 },
  { name: 'drops', min: 0, max: 1, step: 0.01 },
  { name: 'seed', min: 0, max: 1000, step: 0.1 },
  { name: 'scale', min: 0.1, max: 4, step: 0.01, randomMin: 0.4, randomMax: 0.9 },
];

function remap(old: OldParams) {
  return {
    blending: old.contrast,
    distortion: 0.5,
    clip: false,
    angle: 300,
    seed: old.seed,
    roughness: 1.5 * old.roughness * old.contrast * (1 - 0.25 * old.fade),
    roughnessSize: 0.65,
    roughnessRows: 0,
    fiber: old.fiber * 1.5,
    fiberSize: (9 - 1 / old.fiberSize) / 8,
    folds: 0,
    foldSizeX: 0.6,
    foldSizeY: 0.44,
    foldOffsetX: 0,
    foldOffsetY: 0,
    wrinkles: 1.5 * old.crumples * old.contrast * (1 - 0.25 * old.fade),
    // main: .8 / crumpleSize cells across the image, now: .9 * mix(10, 1, wrinkleSize)
    wrinkleSize: (10 - 8 / (9 * old.crumpleSize)) / 9,
    crumples: 1.5 * old.folds * old.contrast * (1 - 0.25 * old.fade),
    crumpleCount: Math.max(2, old.foldCount),
    drops: 1.5 * old.drops * old.contrast * (1 - 0.25 * old.fade),
    colorBack: old.colorBack,
    colorPaper: old.colorBack,
    colorShadow: old.colorFront,
    fit: old.fit, // check if wasn't set?
    scale: old.scale, // check if wasn't set?

    // dropped:
    // contrast, fade
  };
}

const oldValues = oldDefaultParams as Record<string, unknown>;

/** Prop names as the table writes them: "a + b", "a / b", and "fit / scale defaults" */
function propNames(cell: string) {
  if (cell === '—') return [];
  return cell.split(/ \+ | \/ /).map((name) => name.replace(/ defaults$/, ''));
}

function control(name: string, old: OldParams, setOld: (params: OldParams) => void) {
  const spec = sliders.find((slider) => slider.name === name);
  const value = (old as Record<string, unknown>)[name];

  if (spec) {
    return (
      <>
        <input
          type="range"
          min={spec.min}
          max={spec.max}
          step={spec.step}
          value={value as number}
          onChange={(e) => setOld({ ...old, [name]: Number(e.target.value) })}
          className="w-full"
        />
        <span className="w-40 shrink-0 text-right text-current/40 tabular-nums">{String(value)}</span>
      </>
    );
  }

  if (typeof value === 'string' && value.startsWith('#')) {
    return (
      <>
        <input
          type="color"
          value={value}
          onChange={(e) => setOld({ ...old, [name]: e.target.value })}
          className="h-24 w-48"
        />
        <span className="text-current/40">{value}</span>
      </>
    );
  }

  return <span className="text-current/40">{String(value)}</span>;
}

function randomize(): OldParams {
  const params = { ...oldDefaultParams } as Record<string, unknown>;

  for (const { name, min, max, step, randomMin, randomMax } of sliders) {
    const from = randomMin ?? min;
    const to = randomMax ?? max;
    const steps = Math.round((to - from) / step);
    params[name] = Number((from + Math.round(Math.random() * steps) * step).toFixed(4));
  }

  for (const name of ['colorFront', 'colorBack']) {
    params[name] =
      '#' +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0');
  }

  return params as OldParams;
}

export default function PaperTextureMigration() {
  const [old, setOld] = useState<OldParams>(oldDefaultParams);
  const next = remap(old);
  const newValues = next as Record<string, unknown>;

  return (
    <div className="mx-auto box-content max-w-1104 px-16 pt-20 pb-64 xs:px-24 sm:px-32 md:px-48">
      <h1 className="mb-8 text-3xl font-light lowercase">Paper Texture: main → new</h1>
      <p className="mb-24 max-w-720 text-base text-current/70">
        Ticked rows can be left alone, the rest need a look at your own setup.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead>
            <tr className="bg-backplate-2">
              <th className="px-16 py-12 text-left align-top font-medium lowercase">before Sep 2025</th>
              <th className="px-16 py-12 text-left align-top font-medium lowercase">main</th>
              <th className="px-16 py-12 text-left align-top font-medium lowercase">new</th>
              <th className="px-16 py-12 text-left align-top font-medium lowercase">note</th>
              <th className="px-16 py-12 text-left align-top font-medium lowercase">to do</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.legacy + row.before + row.after} className="border-table-border not-last:border-b">
                <td className="min-w-120 px-16 py-12 align-top font-medium whitespace-nowrap">{row.legacy}</td>
                <td className="min-w-140 px-16 py-12 align-top font-medium whitespace-nowrap">{row.before}</td>
                <td className="min-w-140 px-16 py-12 align-top font-medium whitespace-nowrap">{row.after}</td>
                <td className="min-w-240 px-16 py-12 align-top text-pretty text-current/70">{row.note}</td>
                <td className="min-w-200 px-16 py-12 align-top text-pretty text-current/70">
                  {row.toCheck ? null : (
                    <span
                      aria-label="nothing to do"
                      className="mr-8 inline-block size-12 rounded-full align-middle"
                      style={{ background: 'light-dark(#00b34a, #3ee87f)' }}
                    />
                  )}
                  {row.todo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="my-48 border-t border-table-border" />

      <div className="sticky top-0 z-10 grid gap-16 bg-background pt-8 pb-16 sm:grid-cols-2">
        <figure>
          <div className="h-[50vh] overflow-hidden rounded">
            <OldPaperTexture params={old} image={image} style={{ height: '100%', width: '100%' }} />
          </div>
          <figcaption className="mt-8 text-sm text-current/70">
            0.0.79 on npm — the last release before the rework, and what main still holds
          </figcaption>
        </figure>
        <figure>
          <div className="h-[50vh] overflow-hidden rounded">
            <PaperTexture {...next} image={image} style={{ height: '100%', width: '100%' }} />
          </div>
          <figcaption className="mt-8 text-sm text-current/70">This branch, on the same values remapped</figcaption>
        </figure>
      </div>

      <div className="mt-8 mb-16 flex gap-8">
        <button
          type="button"
          onClick={() => setOld(oldDefaultParams)}
          className="rounded bg-backplate-2 px-12 py-6 text-sm"
        >
          reset
        </button>
        <button type="button" onClick={() => setOld(randomize())} className="rounded bg-backplate-2 px-12 py-6 text-sm">
          randomize
        </button>
      </div>

      <div className="grid gap-x-16 sm:grid-cols-2">
        {rows.map((row) => {
          const oldNames = propNames(row.before).filter((name) => name in oldValues);
          const newNames = propNames(row.after).filter((name) => name in newValues);

          return (
            <Fragment key={row.legacy + row.before + row.after}>
              <div className="flex min-h-40 flex-col justify-center gap-4 border-b border-table-border py-8 font-mono text-sm">
                {oldNames.length === 0 && <span className="text-current/40">—</span>}
                {oldNames.map((name) => (
                  <label key={name} className="flex items-center gap-8">
                    <span className="w-140 shrink-0 text-current/70">{name}</span>
                    {control(name, old, setOld)}
                  </label>
                ))}
              </div>

              <div className="flex min-h-40 flex-col justify-center gap-4 border-b border-table-border py-8 font-mono text-sm">
                {newNames.length === 0 && <span className="text-current/40">—</span>}
                {newNames.map((name) => (
                  <div key={name} className="flex gap-8">
                    <span className="w-140 shrink-0 text-current/70">{name}</span>
                    <span className="tabular-nums">{String(newValues[name])}</span>
                  </div>
                ))}
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
