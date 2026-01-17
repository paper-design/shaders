import { useState, useLayoutEffect } from 'react';
import { transparentPixel } from './transparent-pixel.js';
import { suspend } from './suspend.js';

type ImageInput = HTMLImageElement | string;

interface UseProcessedImageOptions {
  /**
   * When true, suspends the component while the image is being processed.
   * Requires a Suspense boundary.
   */
  suspense?: boolean;
  /**
   * Cache key used for suspense deduplication.
   */
  cacheKey: string;
}

/**
 * Hook that processes an image (e.g., ensures SVGs have high-res dimensions).
 * Handles both suspense and non-suspense modes, SSR safety, and cleanup.
 *
 * @param image - The image to process (URL string or HTMLImageElement)
 * @param processFn - Function that takes imageUrl and returns a Promise<Blob>
 * @param options - Configuration options
 * @returns The processed image URL (object URL or transparent pixel)
 */
export function useProcessedImage(
  image: ImageInput | undefined,
  processFn: (imageUrl: string) => Promise<Blob>,
  options: UseProcessedImageOptions
): string {
  const { suspense = false, cacheKey } = options;
  const imageUrl = !image ? '' : typeof image === 'string' ? image : image.src;
  const [processedStateImage, setProcessedStateImage] = useState<string>(transparentPixel);

  let processedImage: string;

  // processFn may expect the document object to exist. This prevents SSR issues during builds.
  if (suspense && typeof window !== 'undefined' && imageUrl) {
    processedImage = suspend(
      (): Promise<string> => processFn(imageUrl).then((blob) => URL.createObjectURL(blob)),
      [imageUrl, cacheKey]
    );
  } else {
    processedImage = processedStateImage;
  }

  useLayoutEffect(() => {
    if (suspense) {
      // Skip doing work in the effect as it's been handled by suspense.
      return;
    }

    if (!imageUrl) {
      setProcessedStateImage(transparentPixel);
      return;
    }

    let url: string;
    let current = true;

    processFn(imageUrl).then((blob) => {
      if (current) {
        url = URL.createObjectURL(blob);
        setProcessedStateImage(url);
      }
    });

    return () => {
      current = false;
    };
  }, [imageUrl, suspense, processFn]);

  return processedImage;
}
