'use client';

import { usePathname } from 'next/navigation';

/** Shader pages are reused at `/<shader>/html-in-canvas`, where the shader takes live HTML children instead of an image */
const htmlInCanvasSuffix = '/html-in-canvas';

export function useIsHtmlInCanvasPage(): boolean {
  return usePathname().endsWith(htmlInCanvasSuffix);
}

/**
 * The same check for callbacks that run later, like Leva's `render`:
 * Leva keeps the settings of the page that registered a control first, so a value captured on mount goes stale
 */
export function isHtmlInCanvasPath(): boolean {
  return typeof window !== 'undefined' && window.location.pathname.endsWith(htmlInCanvasSuffix);
}

/** Links a shader page to its HTML-in-canvas version and back */
export function getHtmlInCanvasToggleHref(pathname: string): string {
  return pathname.endsWith(htmlInCanvasSuffix)
    ? pathname.slice(0, -htmlInCanvasSuffix.length)
    : `${pathname}${htmlInCanvasSuffix}`;
}

/** Leva settings that show a control or folder only on the image page */
export const imageOnly = { render: () => !isHtmlInCanvasPath() };

/** Leva settings that show a control or folder only on the HTML-in-canvas page */
export const htmlOnly = { render: () => isHtmlInCanvasPath() };
