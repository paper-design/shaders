'use client';

import { Fragment, useState } from 'react';
import { PaperTexture, paperTexturePresets } from '@paper-design/shaders-react';
import { OldPaperTexture, oldDefaultParams, type OldParams } from './old-paper-texture';

const images = [
  '/images/image-filters/001.webp',
  '/images/image-filters/0010.webp',
  '/images/image-filters/0011.webp',
  '/images/image-filters/0012.webp',
  '/images/image-filters/0013.webp',
  '/images/image-filters/0014.webp',
  '/images/image-filters/0015.webp',
  '/images/image-filters/0016.webp',
  '/images/image-filters/0017.webp',
  '/images/image-filters/0018.webp',
  '/images/image-filters/0019.webp',
  '/images/image-filters/002.webp',
  '/images/image-filters/003.webp',
  '/images/image-filters/004.webp',
  '/images/image-filters/005.webp',
  '/images/image-filters/006.webp',
  '/images/image-filters/007.webp',
  '/images/image-filters/008.webp',
  '/images/image-filters/009.webp',
  '/images/logos/apple.svg',
  '/images/logos/brave.svg',
  '/images/logos/capy.svg',
  '/images/logos/chanel.svg',
  '/images/logos/cibc.svg',
  '/images/logos/cloudflare.svg',
  '/images/logos/contra.svg',
  '/images/logos/diamond.svg',
  '/images/logos/discord.svg',
  '/images/logos/enterprise-rent.svg',
  '/images/logos/inbound.svg',
  '/images/logos/infinite.svg',
  '/images/logos/linear.svg',
  '/images/logos/mercury.svg',
  '/images/logos/microsoft.svg',
  '/images/logos/mymind.svg',
  '/images/logos/nasa.svg',
  '/images/logos/netflix.svg',
  '/images/logos/nike.svg',
  '/images/logos/paper-logo-only.svg',
  '/images/logos/paper.svg',
  '/images/logos/paradigm.svg',
  '/images/logos/resend.svg',
  '/images/logos/shopify.svg',
  '/images/logos/vercel.svg',
  '/images/logos/volkswagen.svg',
  '/images/logos/wealth-simple.svg',
];

const randomImage = () => images[Math.floor(Math.random() * images.length)];

type Row = { legacy: string; before: string; after: string; note: string; todo: string };

const rows: Row[] = [
  {
    legacy: '—',
    before: 'colorFront',
    after: 'colorShadow',
    note: '',
    todo: 'take as colorShadow',
  },
  {
    legacy: '—',
    before: 'colorBack',
    after: 'colorBack',
    note: 'now less visible',
    todo: 'take as colorBack',
  },
  {
    legacy: '—',
    before: '—',
    after: 'colorPaper',
    note: 'kinda what colorBack was',
    todo: 'take as colorBack but mix with a bit of colorShadow (colorFront) using contrast',
  },
  {
    legacy: '—',
    before: 'contrast',
    after: '—',
    note: 'removed; it was used for overall pattern strength, for image overlay, and for the way colorBack and colorFront mixed together',
    todo: 'feeds roughness, wrinkles, crumples and drops, affects blending value + low contrast pulls colorPaper towards colorShadow',
  },
  {
    legacy: 'blur',
    before: 'fade',
    after: '—',
    note: 'removed, no replacement; it was muting the patterns via noisy mask',
    todo: '(1 - 0.25 x fade) mutes roughness, wrinkles, crumples and drops (uniformly across the canvas, up to 25%)',
  },
  {
    legacy: '—',
    before: 'image',
    after: 'image',
    note: '',
    todo: '',
  },
  {
    legacy: '—',
    before: '—',
    after: 'blending',
    note: 'new (we were blending the picture in with contrast prop)',
    todo: 'using sqrt(contrast) directly',
  },
  {
    legacy: '—',
    before: '—',
    after: 'distortion',
    note: 'new (we were always distorting the pic)',
    todo: 'set to 0.8',
  },
  {
    legacy: '—',
    before: '—',
    after: 'clip',
    note: 'new',
    todo: 'set to false',
  },
  {
    legacy: '—',
    before: '—',
    after: 'angle',
    note: 'new',
    todo: 'set to 300 (like in the Default preset)',
  },
  {
    legacy: '—',
    before: 'seed',
    after: 'seed',
    note: 'same prop, rebuilt',
    todo: 'take directly. there is nothing we can do as it is not possible to match the old seed visually; we just keep the given value and hope it looks nice',
  },
  {
    legacy: '—',
    before: 'roughness',
    after: 'roughness',
    note: 'same prop, rebuilt',
    todo: 'x1.5, then muted by old contrast and old fade',
  },
  {
    legacy: '—',
    before: '—',
    after: 'roughnessSize',
    note: 'new',
    todo: 'set to 0.65',
  },
  {
    legacy: '—',
    before: '—',
    after: 'roughnessRows',
    note: 'new',
    todo: 'set to 0',
  },
  {
    legacy: '—',
    before: 'fiber',
    after: 'fiber',
    note: 'same prop, rebuilt',
    todo: 'x1.5',
  },
  {
    legacy: 'fiberScale',
    before: 'fiberSize',
    after: 'fiberSize',
    note: 'different mapping: main scaled the noise by 1 / fiberSize, now it is mix(4, 1, fiberSize)',
    todo: 'remapped as pow(fiberSize, 0.2) x 1.2 - makes it exceed the 0..1 range which probably will not work in the Paper app',
  },
  {
    legacy: '—',
    before: '—',
    after: 'folds',
    note: 'same prop name was used differently (old folds are now crumples, new folds are straight lines we never had)',
    todo: 'set to 0',
  },
  {
    legacy: '—',
    before: '—',
    after: 'foldSizeX',
    note: 'new',
    todo: 'take a number from Default preset (does not matter)',
  },
  {
    legacy: '—',
    before: '—',
    after: 'foldSizeY',
    note: 'new',
    todo: 'take a number from Default preset (does not matter)',
  },
  {
    legacy: '—',
    before: '—',
    after: 'foldOffsetX',
    note: 'new',
    todo: 'take a number from Default preset (does not matter)',
  },
  {
    legacy: '—',
    before: '—',
    after: 'foldOffsetY',
    note: 'new',
    todo: 'take a number from Default preset (does not matter)',
  },
  {
    legacy: '—',
    before: 'crumples',
    after: 'wrinkles',
    note: 'it is a different pattern but close enough to port directly',
    todo: 'remapped: x2, then scaled by contrast and fade, capped at 1',
  },
  {
    legacy: 'crumplesScale',
    before: 'crumpleSize',
    after: 'wrinkleSize',
    note: '',
    todo: 'remapped: (10 - 8 / (9 x crumpleSize)) / 9',
  },
  {
    legacy: '—',
    before: 'folds',
    after: 'crumples',
    note: 'similar thing but renamed (both shape and randomizer are different but the principle is the same)',
    todo: 'remapped: x2, then scaled by contrast and fade',
  },
  {
    legacy: 'foldsNumber',
    before: 'foldCount',
    after: 'crumpleCount',
    note: 'same range on both sides, 15 max',
    todo: 'clamp to 2 minimum but 1 was not effective in the old version as well',
  },
  {
    legacy: '—',
    before: 'drops',
    after: 'drops',
    note: 'same drops, just different randomizer and different color usage',
    todo: 'remapped: x1.5, then scaled by contrast and fade',
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

function mixHex(from: string, to: string, amount: number) {
  const parse = (hex: string) => {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  };

  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const channel = (a: number, b: number) =>
    Math.round(a + (b - a) * amount)
      .toString(16)
      .padStart(2, '0');

  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
}

function remap(old: OldParams) {
  const oldContrast = Math.pow(old.contrast, 0.5);
  return {
    blending: oldContrast,
    distortion: 0.8,
    clip: false,
    angle: 300,
    seed: old.seed,
    roughness: 1.5 * old.roughness * oldContrast * (1 - 0.25 * old.fade),
    roughnessSize: 0.65,
    roughnessRows: 0,
    fiber: old.fiber * 1.5,
    fiberSize: Math.pow(old.fiberSize, 0.2) * 1.2,
    folds: 0,
    foldSizeX: 0.6,
    foldSizeY: 0.44,
    foldOffsetX: 0,
    foldOffsetY: 0,
    wrinkles: Math.min(1, 2 * old.crumples * oldContrast - 0.25 * old.fade),
    wrinkleSize: (10 - 8 / (9 * old.crumpleSize)) / 9,
    crumples: 2 * old.folds * oldContrast * (1 - 0.25 * old.fade),
    crumpleCount: Math.max(2, old.foldCount),
    drops: 1.5 * old.drops * oldContrast * (1 - 0.25 * old.fade),
    colorBack: old.colorBack,
    colorPaper: mixHex(old.colorBack, old.colorFront, 0.2 * (1 - oldContrast)),
    colorShadow: old.colorFront,
    fit: old.fit,
    scale: old.scale,

    // dropped: contrast, fade
  };
}

const oldValues = oldDefaultParams as Record<string, unknown>;

/** Prop names as the table writes them, "a + b" and "a / b" included */
function propNames(cell: string) {
  if (cell === '—') return [];
  return cell.split(/ \+ | \/ /);
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

function randomNumbers() {
  const params = { ...oldDefaultParams } as Record<string, unknown>;

  for (const { name, min, max, step, randomMin, randomMax } of sliders) {
    const from = randomMin ?? min;
    const to = randomMax ?? max;
    const steps = Math.round((to - from) / step);
    params[name] = Number((from + Math.round(Math.random() * steps) * step).toFixed(4));
  }

  return params;
}

const hslHex = (hue: number, saturation: number, lightness: number) => {
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const a = saturation * Math.min(lightness, 1 - lightness);
    return Math.round((lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
};

function randomize(): OldParams {
  const params = randomNumbers();

  for (const name of ['colorFront', 'colorBack']) {
    params[name] =
      '#' +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0');
  }

  return params as OldParams;
}

/** light sheet under a greyish top, both barely tinted and sharing one hue */
function randomizeBlackAndWhite(): OldParams {
  const params = randomNumbers();
  const hue = Math.random() * 360;
  params.colorBack = hslHex(hue, Math.random() * 0.07, 0.9 + Math.random() * 0.1);
  params.colorFront = hslHex(hue, Math.random() * 0.1, 0.45 + Math.random() * 0.3);
  return params as OldParams;
}

export default function PaperTextureMigration() {
  const [old, setOld] = useState<OldParams>(oldDefaultParams);
  const [image, setImage] = useState('/images/image-filters/0018.webp');
  const next = remap(old);
  const newValues = next as Record<string, unknown>;

  return (
    <div className="mx-auto box-content max-w-1104 px-16 pt-20 pb-64 xs:px-24 sm:px-32 md:px-48">
      <h1 className="mb-8 text-3xl font-light lowercase">Paper Texture: main → new</h1>
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
                <td className="min-w-200 px-16 py-12 align-top text-pretty text-current/70">{row.todo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr className="my-48 border-t border-table-border" />

      <div className="sticky top-0 z-10 grid gap-16 bg-background pt-8 pb-16 sm:grid-cols-2">
        <figure>
          <div className="h-[50vh] cursor-pointer overflow-hidden rounded" onClick={() => setImage(randomImage())}>
            <OldPaperTexture params={old} image={image} style={{ height: '100%', width: '100%' }} />
          </div>
          <figcaption className="mt-8 text-sm text-current/70">
            0.0.79 on npm — the last release before the rework, and what main still holds
          </figcaption>
        </figure>
        <figure>
          <div className="h-[50vh] cursor-pointer overflow-hidden rounded" onClick={() => setImage(randomImage())}>
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
        <button
          type="button"
          onClick={() => setOld(randomizeBlackAndWhite())}
          className="rounded bg-backplate-2 px-12 py-6 text-sm"
        >
          randomize b/w
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
