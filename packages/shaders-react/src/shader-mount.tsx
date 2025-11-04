'use client';

import { useEffect, useRef, forwardRef, useState } from 'react';
import {
  ShaderMount as ShaderMountVanilla,
  getEmptyPixel,
  type PaperShaderElement,
  type ShaderMotionParams,
  type ShaderMountUniforms,
} from '@paper-design/shaders';
import { useMergeRefs } from './use-merge-refs.js';

/**
 * React Shader Mount can also accept strings as uniform values, which will assumed to be URLs and loaded as images
 *
 * We accept undefined as a convenience for server rendering, when some things may be undefined
 * We just skip setting the uniform if it's undefined. This allows the shader mount to still take up space during server rendering
 */
interface ShaderMountUniformsReact {
  [key: string]: string | boolean | number | number[] | number[][] | HTMLImageElement | undefined;
}

export interface ShaderMountProps extends Omit<React.ComponentProps<'div'>, 'color' | 'ref'>, ShaderMotionParams {
  ref?: React.Ref<PaperShaderElement>;
  fragmentShader: string;
  uniforms: ShaderMountUniformsReact;
  mipmaps?: string[];
  minPixelRatio?: number;
  maxPixelCount?: number;
  webGlContextAttributes?: WebGLContextAttributes;

  /** Inline CSS width style */
  width?: string | number;
  /** Inline CSS height style */
  height?: string | number;
}

export interface ShaderComponentProps extends Omit<React.ComponentProps<'div'>, 'color' | 'ref'> {
  ref?: React.Ref<PaperShaderElement>;
  minPixelRatio?: number;
  maxPixelCount?: number;
  webGlContextAttributes?: WebGLContextAttributes;

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
      if (!value) {
        processedUniforms[key] = getEmptyPixel();
        return;
      }

      // Make sure the provided string is a valid URL or just skip trying to set this uniform entirely
      if (!isValidUrl(value)) {
        console.warn(`Uniform "${key}" has invalid URL "${value}". Skipping image loading.`);
        return;
      }

      const imagePromise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        if (isExternalUrl(value)) {
          img.crossOrigin = 'anonymous';
        }
        img.onload = () => {
          processedUniforms[key] = img;
          resolve();
        };
        img.onerror = () => {
          console.error(`Could not set uniforms. Failed to load image at ${value}`);
          reject();
        };
        img.src = value;
      });
      imageLoadPromises.push(imagePromise);
    } else {
      processedUniforms[key] = value;
    }
  });

  await Promise.all(imageLoadPromises);
  return processedUniforms;
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
      mipmaps,
      style,
      ...divProps
    },
    forwardedRef
  ) {
    const [isInitialized, setIsInitialized] = useState(false);
    const divRef = useRef<PaperShaderElement>(null);
    const shaderMountRef: React.RefObject<ShaderMountVanilla | null> = useRef<ShaderMountVanilla>(null);
    const webGlContextAttributesRef = useRef(webGlContextAttributes);

    // Initialize the ShaderMountVanilla
    useEffect(() => {
      const initShader = async () => {
        const uniforms = await processUniforms(uniformsProp);

        if (divRef.current && !shaderMountRef.current) {
          shaderMountRef.current = new ShaderMountVanilla(
            divRef.current,
            fragmentShader,
            uniforms,
            webGlContextAttributesRef.current,
            speed,
            frame,
            minPixelRatio,
            maxPixelCount,
            mipmaps
          );

          setIsInitialized(true);
        }
      };

      initShader();

      return () => {
        shaderMountRef.current?.dispose();
        shaderMountRef.current = null;
      };
    }, [fragmentShader]);

    // Uniforms
    useEffect(() => {
      let isStale = false;

      const updateUniforms = async () => {
        const uniforms = await processUniforms(uniformsProp);

        if (!isStale) {
          // We only use the freshest uniforms otherwise we can get into race conditions
          // if some uniforms (images!) take longer to load in subsequent effect runs.
          shaderMountRef.current?.setUniforms(uniforms);
        }
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
              }
            : style
        }
        {...divProps}
      />
    );
  }
);

ShaderMount.displayName = 'ShaderMount';
