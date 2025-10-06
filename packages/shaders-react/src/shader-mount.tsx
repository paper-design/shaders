'use client';

import { useEffect, useRef, forwardRef, useState, useLayoutEffect } from 'react';
import {
  ShaderMount as ShaderMountVanilla,
  type PaperShaderElement,
  type ShaderMotionParams,
  type ShaderMountUniforms,
} from '@paper-design/shaders';
import { useMergeRefs } from './use-merge-refs.js';
import { transparentPixel } from './transparent-pixel.js';
import { fastDeepEqual } from './fast-deep-equal.js';

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
        // Use a transparent pixel for empty strings
        img.src = value || transparentPixel;
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
      fragmentShader: fragmentShaderProp,
      uniforms: uniformsProp,
      webGlContextAttributes,
      speed = 0,
      frame = 0,
      width,
      height,
      minPixelRatio,
      maxPixelCount,
      style,
      ...divProps
    },
    forwardedRef
  ) {
    const containerRef = useRef<PaperShaderElement>(null);
    const [shaderMount, setShaderMount] = useState<ShaderMountVanilla | null>(null);

    // Uniforms that have been registered for processing or already processed
    const uniformsRegistered = useRef<ShaderMountUniformsReact>(null);

    // Save the initial shader fragment and context attributes, they are not allowed to change
    const [initialShaderFragment] = useState(fragmentShaderProp);
    const [initialContextAttrs] = useState(webGlContextAttributes);

    // Initial frame that the animation starts at
    const initialFrame = useRef(frame);

    const [documentVisible, setDocumentVisible] = useState(() => {
      return typeof window === 'undefined' || document.hidden === false;
    });

    useLayoutEffect(() => {
      let cancelPromise = false;

      // Check if uniforms have changed, if yes we'll schedule processing
      const uniformsDidChange = !fastDeepEqual(uniformsRegistered.current, uniformsProp);

      if (uniformsDidChange) {
        processUniforms(uniformsProp).then((uniforms) => {
          if (cancelPromise || !containerRef.current) {
            return;
          }

          uniformsRegistered.current = uniformsProp;

          // If shader mount already exists, we can update the uniforms
          if (shaderMount) {
            shaderMount.setUniforms(uniforms);
            return;
          }

          // Otherwise, initialize a new shader mount
          const canvas = new ShaderMountVanilla(
            containerRef.current,
            initialShaderFragment,
            uniforms,
            initialContextAttrs,
            speed,
            frame,
            minPixelRatio,
            maxPixelCount
          );

          setShaderMount(canvas);
        });
      }

      if (shaderMount) {
        if (shaderMount.speed !== speed) {
          shaderMount.setSpeed(speed);
        }

        if (initialFrame.current !== frame) {
          initialFrame.current = frame;
          shaderMount.setFrame(frame);
        }

        if (shaderMount.minPixelRatio !== minPixelRatio) {
          shaderMount.setMinPixelRatio(minPixelRatio);
        }

        if (shaderMount.maxPixelCount !== maxPixelCount) {
          shaderMount.setMaxPixelCount(maxPixelCount);
        }
      }

      return () => {
        // Cancel the promise if we scheduled uniform processing
        cancelPromise = uniformsDidChange;
      };
    }, [
      documentVisible,
      frame,
      initialContextAttrs,
      initialShaderFragment,
      maxPixelCount,
      minPixelRatio,
      shaderMount,
      speed,
      uniformsProp,
    ]);

    // Free up shader mount resources when the component unmounts
    useEffect(() => {
      return () => {
        shaderMount?.dispose();
      };
    }, [shaderMount]);

    return (
      <div
        ref={useMergeRefs([containerRef, forwardedRef]) as unknown as React.RefObject<HTMLDivElement>}
        style={width !== undefined || height !== undefined ? { width, height, ...style } : style}
        {...divProps}
      />
    );
  }
);

ShaderMount.displayName = 'ShaderMount';
