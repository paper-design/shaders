'use client';

import { Children, forwardRef, useEffect, useState, useSyncExternalStore } from 'react';
import { captureHtmlImage, isHtmlInCanvasSupported, type PaperShaderElement } from '@paper-design/shaders';

const subscribeToNothing = () => () => {};

/** Whether the browser supports HTML-in-canvas, always false during server rendering and hydration */
export function useHtmlInCanvasSupport(): boolean {
  return useSyncExternalStore(subscribeToNothing, isHtmlInCanvasSupported, () => false);
}

export function hasChildren(children: React.ReactNode): boolean {
  return Children.toArray(children).length > 0;
}

interface HtmlCanvasProps {
  children?: React.ReactNode;
}

/** A `<canvas layoutsubtree>` that lays out its children so they can be captured into shader textures */
export const HtmlCanvas: React.ForwardRefExoticComponent<HtmlCanvasProps & React.RefAttributes<HTMLDivElement>> =
  forwardRef<HTMLDivElement, HtmlCanvasProps>(function HtmlCanvasImpl({ children }, ref) {
    return (
      <canvas {...{ layoutsubtree: '' }}>
        <div ref={ref}>{children}</div>
      </canvas>
    );
  });

/**
 * Keeps a processed snapshot of the HTML children for shaders that pre-process their image.
 * Captures once when enabled, then again on every `refreshHtmlImage()` call on the shader element.
 * `processImage` should be defined outside the component so it keeps its identity between renders.
 */
export function useProcessedHtmlImage(
  htmlRef: React.RefObject<HTMLDivElement | null>,
  isEnabled: boolean,
  processImage: (url: string) => Promise<Blob>
): string | undefined {
  const [processedUrl, setProcessedUrl] = useState<string>();

  useEffect(() => {
    const html = htmlRef.current;
    const shaderElement = html?.parentElement?.parentElement as PaperShaderElement | null | undefined;
    if (!isEnabled || !html || !shaderElement) return;

    let isCurrent = true;
    let isRefreshing = false;
    let hasPendingRefresh = false;
    // The previous URL may still be loading into the shader when a new one arrives, so revoke one step behind
    const urls: string[] = [];

    const captureAndProcess = async () => {
      const snapshotUrl = URL.createObjectURL(await captureHtmlImage(html));

      try {
        const processed = await processImage(snapshotUrl);
        if (!isCurrent) return;

        urls.push(URL.createObjectURL(processed));
        while (urls.length > 2) {
          URL.revokeObjectURL(urls.shift()!);
        }
        setProcessedUrl(urls[urls.length - 1]);
      } finally {
        URL.revokeObjectURL(snapshotUrl);
      }
    };

    // Processing takes a while, so calls made in the meantime collapse into one more run with the latest HTML
    const refresh = async () => {
      if (isRefreshing) {
        hasPendingRefresh = true;
        return;
      }

      isRefreshing = true;
      try {
        do {
          hasPendingRefresh = false;
          await captureAndProcess();
        } while (hasPendingRefresh && isCurrent);
      } finally {
        isRefreshing = false;
      }
    };

    shaderElement.refreshHtmlImage = () => {
      refresh().catch((error) => console.error('Paper Shaders: could not process the HTML image', error));
    };
    shaderElement.refreshHtmlImage();

    return () => {
      isCurrent = false;
      delete shaderElement.refreshHtmlImage;
      urls.forEach((url) => URL.revokeObjectURL(url));
      setProcessedUrl(undefined);
    };
  }, [isEnabled, processImage]);

  return processedUrl;
}
