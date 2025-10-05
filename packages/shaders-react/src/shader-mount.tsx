'use client';

import { useEffect, useRef, forwardRef, useState } from 'react';
import {
  ShaderMount as ShaderMountVanilla,
  type PaperShaderElement,
  type ShaderMotionParams,
  type ShaderMountUniforms,
} from '@paper-design/shaders';
import { useMergeRefs } from './use-merge-refs.js';
import { transparentPixel } from './transparent-pixel.js';

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
      fragmentShader,
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
    const [shaderParent, setShaderParent] = useState<PaperShaderElement | null>(null);
    const [shaderMount, setShaderMount] = useState<ShaderMountVanilla | null>(null);
    const uniformsRegistered = useRef<ShaderMountUniformsReact>(null);
    const startingFrame = useRef(frame);

    const [documentVisible, setDocumentVisible] = useState(() => {
      return typeof window === 'undefined' || document.hidden === false;
    });

    // Initialize when:
    // - we have the parent element
    // - there is no shader mount yet
    // - uniforms being processed do not match the props
    if (shaderParent && !shaderMount && uniformsRegistered.current !== uniformsProp) {
      uniformsRegistered.current = uniformsProp;

      processUniforms(uniformsProp).then((uniforms) => {
        // Skip if uniforms have changed since we registered them
        if (uniformsRegistered.current !== uniformsProp) {
          return;
        }

        const element = new ShaderMountVanilla(
          shaderParent,
          fragmentShader,
          uniforms,
          webGlContextAttributes,
          speed,
          frame,
          minPixelRatio,
          maxPixelCount
        );

        setShaderMount(element);
      });
    }

    if (shaderMount) {
      if (uniformsRegistered.current !== uniformsProp) {
        uniformsRegistered.current = uniformsProp;

        processUniforms(uniformsProp).then((uniforms) => {
          // Skip if uniforms have changed since we registered them
          if (uniformsRegistered.current !== uniformsProp) {
            return;
          }

          shaderMount.setUniforms(uniforms);
        });
      }

      if (documentVisible === document.hidden) {
        setDocumentVisible(!document.hidden);
      }

      // Pause if the document is hidden
      if (shaderMount.speed !== speed * +documentVisible) {
        shaderMount.setSpeed(speed * +documentVisible);
      }

      if (startingFrame.current !== frame) {
        shaderMount.setFrame(frame);
        startingFrame.current = frame;
      }

      if (shaderMount.minPixelRatio !== minPixelRatio) {
        shaderMount.setMinPixelRatio(minPixelRatio);
      }

      if (shaderMount.maxPixelCount !== maxPixelCount) {
        shaderMount.setMaxPixelCount(maxPixelCount);
      }
    }

    useEffect(() => {
      function onVisibilityChange() {
        setDocumentVisible(!document.hidden);
      }

      document.addEventListener('visibilitychange', onVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
      };
    }, []);

    useEffect(() => {
      return () => {
        shaderMount?.dispose();
      };
    }, [shaderMount]);

    return (
      <div
        ref={useMergeRefs([setShaderParent, forwardedRef]) as unknown as React.RefObject<HTMLDivElement>}
        style={width !== undefined || height !== undefined ? { width, height, ...style } : style}
        {...divProps}
      />
    );
  }
);

ShaderMount.displayName = 'ShaderMount';
