'use client';

import { useEffect, useRef, forwardRef, useState } from 'react';
import {
  ShaderMount as ShaderMountVanilla,
  type ShaderMotionParams,
  type ShaderMountUniforms,
} from '@paper-design/shaders';
import { useMergeRefs } from './use-merge-refs';

export interface ShaderMountRef extends HTMLDivElement {
  paperShaderMount?: ShaderMountVanilla;
}

/** React Shader Mount can also accept strings as uniform values, which will assumed to be URLs and loaded as images */
interface ShaderMountUniformsReact {
  [key: string]: string | boolean | number | number[] | number[][] | HTMLImageElement;
}

export interface ShaderMountProps extends Omit<React.ComponentProps<'div'>, 'color'>, ShaderMotionParams {
  fragmentShader: string;
  uniforms: ShaderMountUniformsReact;
  minPixelRatio?: number;
  maxPixelCount?: number;
  webGlContextAttributes?: WebGLContextAttributes;
}

export interface ShaderComponentProps extends Omit<React.ComponentProps<'div'>, 'color'> {
  minPixelRatio?: number;
  maxPixelCount?: number;
  webGlContextAttributes?: WebGLContextAttributes;
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
export const ShaderMount: React.FC<ShaderMountProps> = forwardRef<ShaderMountRef, ShaderMountProps>(
  function ShaderMountImpl(
    {
      fragmentShader,
      uniforms: uniformsProp,
      webGlContextAttributes,
      speed = 0,
      frame = 0,
      minPixelRatio,
      maxPixelCount,
      ...divProps
    },
    forwardedRef
  ) {
    const [isInitialized, setIsInitialized] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);
    const shaderMountRef: React.RefObject<ShaderMountVanilla | null> = useRef<ShaderMountVanilla>(null);

    // Initialize the ShaderMountVanilla
    useEffect(() => {
      const initShader = async () => {
        const uniforms = await processUniforms(uniformsProp);

        if (divRef.current && !shaderMountRef.current) {
          shaderMountRef.current = new ShaderMountVanilla(
            divRef.current,
            fragmentShader,
            uniforms,
            webGlContextAttributes,
            speed,
            frame,
            minPixelRatio,
            maxPixelCount
          );

          setIsInitialized(true);
        }
      };

      initShader();

      return () => {
        shaderMountRef.current?.dispose();
        shaderMountRef.current = null;
      };
    }, [fragmentShader, webGlContextAttributes]);

    // Uniforms
    useEffect(() => {
      const updateUniforms = async () => {
        const uniforms = await processUniforms(uniformsProp);
        shaderMountRef.current?.setUniforms(uniforms);
      };

      updateUniforms();
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

    return <div ref={useMergeRefs([divRef, forwardedRef])} {...divProps} />;
  }
);

ShaderMount.displayName = 'ShaderMount';
