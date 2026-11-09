'use client';

import { button, folder } from 'leva';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

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

/** The filled button of the HTML-in-canvas demos: the toggle to the other demo and the full code toggle */
export const demoButtonClassName =
  'flex h-32 cursor-pointer items-center rounded-md bg-backplate-2 px-12 text-base outline-0 outline-focus transition-colors hover:bg-backplate-3 focus-visible:outline-2 squircle:rounded-lg';

/** Links a shader page to its HTML-in-canvas version and back */
export function getHtmlInCanvasToggleHref(pathname: string): string {
  return pathname.endsWith(htmlInCanvasSuffix)
    ? pathname.slice(0, -htmlInCanvasSuffix.length)
    : `${pathname}${htmlInCanvasSuffix}`;
}

/** Leva settings that show a control or folder only when the shader's input is an image */
export const imageInputOnly = { render: () => !isHtmlInCanvasPath() };

/** Leva settings that show a control or folder only when the shader's input is HTML */
export const htmlInputOnly = { render: () => isHtmlInCanvasPath() };

export function originControls(defaults: { originX: number; originY: number }, order: number) {
  return {
    originX: { value: defaults.originX, min: 0, max: 1, order, ...htmlInputOnly },
    originY: { value: defaults.originY, min: 0, max: 1, order: order + 0.1, ...htmlInputOnly },
  };
}

export function htmlResetFolder(reset: () => void) {
  return folder({ Reset: button(reset) }, { order: -1, ...htmlInputOnly });
}

/**
 * Lets the Leva panel drive state an example keeps for its own in-HTML controls: whichever changed last wins.
 * Calls to it are marked `// docs-only`, so they stay out of the code sample and the copied app.
 */
export function useFollowPanel<T>(value: T | undefined, apply: (value: T) => void) {
  useEffect(() => {
    if (value !== undefined) apply(value);
  }, [value]);
}
