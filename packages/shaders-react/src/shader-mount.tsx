import React, { useEffect, useRef } from 'react';
import { ShaderMount as ShaderMountVanilla, type ShaderMountUniforms } from '@paper-design/shaders';

/** The React ShaderMount can also accept strings as uniform values, which will assumed to be URLs and loaded as images */
export type ShaderMountUniformsReact = { [key: string]: ShaderMountUniforms[keyof ShaderMountUniforms] | string };

export interface ShaderMountProps {
  ref?: React.RefObject<HTMLCanvasElement>;
  fragmentShader: string;
  style?: React.CSSProperties;
  uniforms?: ShaderMountUniformsReact;
  webGlContextAttributes?: WebGLContextAttributes;
  speed?: number;
  seed?: number;
}

/** Params that every shader can set as part of their controls */
export type GlobalParams = Pick<ShaderMountProps, 'speed' | 'seed'>;

/** Parse the provided uniforms, turning URL strings into loaded images */
const processUniforms = (uniforms: ShaderMountUniformsReact): Promise<ShaderMountUniforms> => {
  const processedUniforms: ShaderMountUniforms = {};
  const imageLoadPromises: Promise<void>[] = [];

  Object.entries(uniforms).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const imagePromise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
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
export const ShaderMount: React.FC<ShaderMountProps> = ({
  ref,
  fragmentShader,
  style,
  uniforms = {},
  webGlContextAttributes,
  speed = 1,
  seed = 0,
}) => {
  const canvasRef = ref ?? useRef<HTMLCanvasElement>(null);
  const shaderMountRef = useRef<ShaderMountVanilla | null>(null);

  useEffect(() => {
    const initShader = async () => {
      if (canvasRef.current) {
        const processedUniforms = await processUniforms(uniforms);
        shaderMountRef.current = new ShaderMountVanilla(
          canvasRef.current,
          fragmentShader,
          processedUniforms,
          webGlContextAttributes,
          speed,
          seed
        );
      }
    };

    initShader();

    return () => {
      shaderMountRef.current?.dispose();
    };
  }, [fragmentShader, webGlContextAttributes]);

  useEffect(() => {
    const updateUniforms = async () => {
      const processedUniforms = await processUniforms(uniforms);
      shaderMountRef.current?.setUniforms(processedUniforms);
    };

    updateUniforms();
  }, [uniforms]);

  useEffect(() => {
    shaderMountRef.current?.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    shaderMountRef.current?.setSeed(seed);
  }, [seed]);

  return <canvas ref={canvasRef} style={style} />;
};
