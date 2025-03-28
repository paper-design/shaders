import React, { useEffect, useRef, forwardRef, useState, useId } from 'react';
import { ShaderMount as ShaderMountVanilla, type ShaderMountUniforms } from '@paper-design/shaders';
import { useMergeRefs } from './use-merge-refs';

/** The React ShaderMount can also accept strings as uniform values, which will assumed to be URLs and loaded as images */
export type ShaderMountUniformsReact = { [key: string]: ShaderMountUniforms[keyof ShaderMountUniforms] | string };

export interface ShaderMountProps extends Omit<React.ComponentProps<'div'>, 'color'> {
  shaderMountRef?: React.RefObject<ShaderMountVanilla | null>;
  fragmentShader: string;
  uniforms?: ShaderMountUniformsReact;
  webGlContextAttributes?: WebGLContextAttributes;
  maxResolution?: number;
  speed?: number;
  frame?: number;
}

/** Params that every shader can set as part of their controls */
export type GlobalParams = Pick<ShaderMountProps, 'speed' | 'frame'>;

/** Parse the provided uniforms, turning URL strings into loaded images */
const processUniforms = (uniforms: ShaderMountUniformsReact): Promise<ShaderMountUniforms> => {
  const processedUniforms: ShaderMountUniforms = {};
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

  Object.entries(uniforms).forEach(([key, value]) => {
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

  return Promise.all(imageLoadPromises).then(() => processedUniforms);
};

/**
 * A React component that mounts a shader and updates its uniforms as the component's props change
 * If you pass a string as a uniform value, it will be assumed to be a URL and attempted to be loaded as an image
 */
export const ShaderMount: React.FC<ShaderMountProps> = forwardRef<HTMLDivElement, ShaderMountProps>(
  function ShaderMountImpl(
    {
      shaderMountRef: externalShaderMountRef,
      fragmentShader,
      uniforms = {},
      webGlContextAttributes,
      speed = 1,
      frame = 0,
      maxResolution,
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
        const processedUniforms = await processUniforms(uniforms);
        if (divRef.current && !shaderMountRef.current) {
          shaderMountRef.current = new ShaderMountVanilla(
            divRef.current,
            fragmentShader,
            processedUniforms,
            webGlContextAttributes,
            speed,
            frame,
            maxResolution
          );

          if (externalShaderMountRef) {
            externalShaderMountRef.current = shaderMountRef.current;
          }

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
        const processedUniforms = await processUniforms(uniforms);
        shaderMountRef.current?.setUniforms(processedUniforms);
      };

      updateUniforms();
    }, [uniforms, isInitialized]);

    // Speed
    useEffect(() => {
      shaderMountRef.current?.setSpeed(speed);
    }, [speed, isInitialized]);

    // Frame
    useEffect(() => {
      shaderMountRef.current?.setFrame(frame);
    }, [frame, isInitialized]);

    return <div ref={useMergeRefs([divRef, forwardedRef])} {...divProps} />;
  }
);

ShaderMount.displayName = 'ShaderMount';
