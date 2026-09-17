'use client';

import { usePathname } from 'next/navigation';

/** Shader pages are reused at `/<shader>/html-in-canvas`, where the shader takes live HTML children instead of an image */
export function useIsHtmlInCanvasPage(): boolean {
  return usePathname().endsWith('/html-in-canvas');
}

/**
 * The same check for callbacks that run later, like Leva's `render`:
 * Leva keeps the settings of the page that registered a control first, so a value captured on mount goes stale
 */
export function isHtmlInCanvasPath(): boolean {
  return typeof window !== 'undefined' && window.location.pathname.endsWith('/html-in-canvas');
}
