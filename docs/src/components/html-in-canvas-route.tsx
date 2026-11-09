import fs from 'node:fs';
import path from 'node:path';
import type { ReactNode } from 'react';
import { ExampleSourceProvider } from './html-in-canvas-demo';

/**
 * Reads a shader's example files, so the code sample on its page is their real source.
 * Examples load images from this site, the copied code loads them from production.
 */
export function HtmlInCanvasRoute({ shader, children }: { shader: string; children: ReactNode }) {
  const directory = path.join(process.cwd(), 'src/app/(shaders)', shader, 'html-in-canvas');
  const source = fs
    .readFileSync(path.join(directory, 'example.jsx'), 'utf8')
    .replaceAll('"/images/', '"https://shaders.paper.design/images/');
  const css = fs.readFileSync(path.join(directory, 'example.css'), 'utf8');

  return <ExampleSourceProvider value={{ source, css }}>{children}</ExampleSourceProvider>;
}
