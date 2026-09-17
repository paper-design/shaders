'use client';

import { Children, forwardRef, useEffect, useState } from 'react';
import { captureHtmlImage } from '@paper-design/shaders';

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
 * Keeps a processed snapshot of the HTML children for shaders that pre-process their image,
 * re-capturing whenever the HTML repaints.
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
    const canvas = html?.parentElement;
    if (!isEnabled || !html || !canvas) return;

    let isCurrent = true;
    let isCapturing = false;
    let isRefreshing = false;
    let hasPendingRefresh = false;
    // The previous URL may still be loading into the shader when a new one arrives, so revoke one step behind
    const urls: string[] = [];

    const captureAndProcess = async () => {
      isCapturing = true;
      const snapshot = await captureHtmlImage(html).finally(() => {
        // Capturing paints the canvas itself, let that paint event pass before listening again
        requestAnimationFrame(() => (isCapturing = false));
      });
      const snapshotUrl = URL.createObjectURL(snapshot);

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

    // Processing takes a while, so repaints in the meantime collapse into one more run with the latest HTML
    const runRefresh = async () => {
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

    const refresh = () => {
      runRefresh().catch((error) => console.error('Paper Shaders: could not process the HTML image', error));
    };

    const handlePaint = () => {
      if (!isCapturing) refresh();
    };

    canvas.addEventListener('paint', handlePaint);
    refresh();

    return () => {
      isCurrent = false;
      canvas.removeEventListener('paint', handlePaint);
      urls.forEach((url) => URL.revokeObjectURL(url));
      setProcessedUrl(undefined);
    };
  }, [isEnabled, processImage]);

  return processedUrl;
}
