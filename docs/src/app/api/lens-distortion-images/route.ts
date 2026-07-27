import { readdirSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

// Lists the extra lens-distortion test images. They live outside the repo (an external working
// folder) and are exposed to the dev server through the gitignored symlink
// public/images/lens-distortion -> that folder. Returns web paths the page can load directly.
// Returns an empty list if the symlink / folder is absent (e.g. on CI or another machine).
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

export const dynamic = 'force-dynamic'; // re-read the folder on every request

export function GET() {
  const dir = join(process.cwd(), 'public/images/lens-distortion');
  try {
    const files = readdirSync(dir)
      .filter((f) => IMAGE_EXT.test(f))
      .sort();
    return NextResponse.json(files.map((f) => `/images/lens-distortion/${encodeURIComponent(f)}`));
  } catch {
    return NextResponse.json([]);
  }
}
