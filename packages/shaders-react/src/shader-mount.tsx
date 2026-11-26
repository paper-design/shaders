'use client';

import { useEffect, useRef, forwardRef, useState } from 'react';
import {
  ShaderMount as ShaderMountVanilla,
  emptyPixel,
  type PaperShaderElement,
  type ShaderMotionParams,
  type ShaderMountUniforms,
  type ShaderSizeToContent,
} from '@paper-design/shaders';
import { useMergeRefs } from './use-merge-refs.js';
import { setMinImageSize } from './set-min-image-size.js';
import { useHtmlChildren } from './html-in-canvas.js';

/**
 * React Shader Mount can also accept strings as uniform values, which will assumed to be URLs and loaded as images
 *
 * We accept undefined as a convenience for server rendering, when some things may be undefined
 * We just skip setting the uniform if it's undefined. This allows the shader mount to still take up space during server rendering
 */
interface ShaderMountUniformsReact {
  [key: string]: string | boolean | number | number[] | number[][] | HTMLImageElement | HTMLElement | undefined;
}

export interface ShaderMountProps extends Omit<React.ComponentProps<'div'>, 'color' | 'ref'>, ShaderMotionParams {
  ref?: React.Ref<PaperShaderElement>;
  fragmentShader: string;
  uniforms: ShaderMountUniformsReact;
  mipmaps?: string[];
  minPixelRatio?: number;
  maxPixelCount?: number;
  resolutionScale?: number;
  webGlContextAttributes?: WebGLContextAttributes;
  acceptsHtmlChildren?: boolean;
  sizeToContent?: ShaderSizeToContent;

  /** Inline CSS width style */
  width?: string | number;
  /** Inline CSS height style */
  height?: string | number;
}

export interface ShaderComponentProps extends Omit<React.ComponentProps<'div'>, 'color' | 'ref'> {
  ref?: React.Ref<PaperShaderElement>;
  minPixelRatio?: number;
  maxPixelCount?: number;
  resolutionScale?: number;
  webGlContextAttributes?: WebGLContextAttributes;
  sizeToContent?: ShaderSizeToContent;

  /** Inline CSS width style */
  width?: string | number;
  /** Inline CSS height style */
  height?: string | number;
}

/** Parse the provided uniforms, turning URL strings into loaded images */
async function processUniforms(uniformsProp: ShaderMountUniformsReact): Promise<ShaderMountUniforms> {
  const processedUniforms = {} as ShaderMountUniforms;
  const imageLoadPromises: Promise<void>[] = [];

  const isValidUrl = (url: string): boolean => {
    try {
      // Handle absolute paths
      if (url.startsWith('/')) return true;
      // Check if it's a valid URL
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isExternalUrl = (url: string): boolean => {
    try {
      if (url.startsWith('/')) return false;
      const urlObject = new URL(url, window.location.origin);
      return urlObject.origin !== window.location.origin;
    } catch {
      return false;
    }
  };

  Object.entries(uniformsProp).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Use a transparent pixel for empty strings
      const url = value || emptyPixel;

      // Make sure the provided string is a valid URL or just skip trying to set this uniform entirely
      if (!isValidUrl(url)) {
        console.warn(`Uniform "${key}" has invalid URL "${url}". Skipping image loading.`);
        return;
      }

      const imagePromise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        if (isExternalUrl(url)) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          setMinImageSize(img);
          processedUniforms[key] = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Could not set uniforms. Failed to load image at ${url}`);
          reject();
        };
        img.src = url;
      });

      imageLoadPromises.push(imagePromise);
    } else if (value instanceof HTMLImageElement) {
      const imagePromise = value.decode().then(() => {
        setMinImageSize(value);
        processedUniforms[key] = value;
      });
      imageLoadPromises.push(imagePromise);
    } else {
      processedUniforms[key] = value;
    }
  });

  await Promise.all(imageLoadPromises);
  return processedUniforms;
}

/** The uniforms that differ from the applied ones */
function getChangedUniforms(
  uniforms: ShaderMountUniformsReact,
  appliedUniforms: ShaderMountUniformsReact
): ShaderMountUniformsReact {
  const changedUniforms: ShaderMountUniformsReact = {};
  for (const [key, value] of Object.entries(uniforms)) {
    if (!areUniformValuesEqual(value, appliedUniforms[key])) {
      changedUniforms[key] = value;
    }
  }
  return changedUniforms;
}

function areUniformValuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
    return a.every((value, i) => areUniformValuesEqual(value, b[i]));
  }
  return false;
}

/**
 * A React component that mounts a shader and updates its uniforms as the component's props change
 * If you pass a string as a uniform value, it will be assumed to be a URL and attempted to be loaded as an image
 */
export const ShaderMount: React.FC<ShaderMountProps> = forwardRef<PaperShaderElement, ShaderMountProps>(
  function ShaderMountImpl(
    {
      fragmentShader,
      uniforms: uniformsProp,
      webGlContextAttributes,
      speed = 0,
      frame = 0,
      width,
      height,
      minPixelRatio,
      maxPixelCount,
      resolutionScale,
      mipmaps,
      acceptsHtmlChildren = false,
      sizeToContent,
      children,
      style,
      ...divProps
    },
    forwardedRef
  ) {
    const [isInitialized, setIsInitialized] = useState(false);
    const divRef = useRef<PaperShaderElement>(null);
    const shaderMountRef: React.RefObject<ShaderMountVanilla | null> = useRef<ShaderMountVanilla>(null);
    const webGlContextAttributesRef = useRef(webGlContextAttributes);
    /** The uniform props the mount has, as passed before processing */
    const appliedUniformsRef = useRef<ShaderMountUniformsReact>({});
    const { hasHtmlChildren, addHtmlUniform, renderedChildren, shaderAttributes, sizeStyle } = useHtmlChildren(
      acceptsHtmlChildren,
      children,
      sizeToContent,
      divRef
    );

    const getUniforms = (): ShaderMountUniformsReact => addHtmlUniform(uniformsProp);

    // Initialize the ShaderMountVanilla
    useEffect(() => {
      let isStale = false;

      const initShader = async () => {
        const initialUniforms = getUniforms();
        const uniforms = await processUniforms(initialUniforms);

        if (!isStale && divRef.current && !shaderMountRef.current) {
          shaderMountRef.current = new ShaderMountVanilla(
            divRef.current,
            fragmentShader,
            uniforms,
            webGlContextAttributesRef.current,
            speed,
            frame,
            minPixelRatio,
            maxPixelCount,
            mipmaps,
            resolutionScale
          );
          appliedUniformsRef.current = initialUniforms;

          setIsInitialized(true);
        }

        await shaderMountRef.current?.ready;
        return shaderMountRef.current;
      };

      const ready = initShader();
      if (divRef.current) {
        divRef.current.paperShaderMountReady = ready;
      }

      return () => {
        isStale = true;
        shaderMountRef.current?.dispose();
        shaderMountRef.current = null;
      };
    }, [fragmentShader, hasHtmlChildren]);

    // Uniforms
    useEffect(() => {
      // The mount is created with the uniforms of that moment
      if (!shaderMountRef.current) return;

      // Uniforms are a new object on every render, unchanged images aren't loaded again
      const changedUniforms = getChangedUniforms(getUniforms(), appliedUniformsRef.current);
      if (Object.keys(changedUniforms).length === 0) return;

      let isStale = false;

      const updateUniforms = async () => {
        const uniforms = await processUniforms(changedUniforms);

        // We only use the freshest uniforms otherwise we can get into race conditions
        // if some uniforms (images!) take longer to load in subsequent effect runs.
        // A stale run isn't marked applied, so the next run includes its changes
        if (isStale || !shaderMountRef.current) return;

        shaderMountRef.current.setUniforms(uniforms);
        appliedUniformsRef.current = { ...appliedUniformsRef.current, ...changedUniforms };
      };

      updateUniforms();

      return () => {
        isStale = true;
      };
    }, [uniformsProp, isInitialized]);

    // Speed
    useEffect(() => {
      shaderMountRef.current?.setSpeed(speed);
    }, [speed, isInitialized]);

    // Max Pixel Count
    useEffect(() => {
      shaderMountRef.current?.setMaxPixelCount(maxPixelCount);
    }, [maxPixelCount, isInitialized]);

    // Min Pixel Ratio
    useEffect(() => {
      shaderMountRef.current?.setMinPixelRatio(minPixelRatio);
    }, [minPixelRatio, isInitialized]);

    // Resolution Scale
    useEffect(() => {
      shaderMountRef.current?.setResolutionScale(resolutionScale);
    }, [resolutionScale, isInitialized]);

    // Frame
    useEffect(() => {
      shaderMountRef.current?.setFrame(frame);
    }, [frame, isInitialized]);

    const mergedRef = useMergeRefs([divRef, forwardedRef]) as unknown as React.RefObject<HTMLDivElement>;
    return (
      <div
        ref={mergedRef}
        style={
          width !== undefined || height !== undefined
            ? {
                width: typeof width === 'string' && isNaN(+width) === false ? +width : width,
                height: typeof height === 'string' && isNaN(+height) === false ? +height : height,
                ...style,
                ...sizeStyle,
              }
            : { ...style, ...sizeStyle }
        }
        {...shaderAttributes}
        {...divProps}
      >
        {renderedChildren}
      </div>
    );
  }
);

ShaderMount.displayName = 'ShaderMount';
