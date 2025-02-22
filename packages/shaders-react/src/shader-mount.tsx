import React, { useEffect, useRef } from 'react';
import { ShaderMount as ShaderMountVanilla, type ShaderMountUniforms } from '@paper-design/shaders';

export interface ShaderMountProps {
  ref?: React.RefObject<HTMLCanvasElement>;
  fragmentShader: string;
  style?: React.CSSProperties;
  uniforms?: ShaderMountUniforms;
  webGlContextAttributes?: WebGLContextAttributes;
  speed?: number;
  seed?: number;
}

/** Params that every shader can set as part of their controls */
export type GlobalParams = Pick<ShaderMountProps, 'speed' | 'seed'>;

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
    if (canvasRef.current) {
      shaderMountRef.current = new ShaderMountVanilla(
        canvasRef.current,
        fragmentShader,
        uniforms,
        webGlContextAttributes,
        speed,
        seed
      );
    }

    return () => {
      shaderMountRef.current?.dispose();
    };
  }, [fragmentShader, webGlContextAttributes]);

  useEffect(() => {
    shaderMountRef.current?.setUniforms(uniforms);
  }, [uniforms]);

  useEffect(() => {
    shaderMountRef.current?.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    shaderMountRef.current?.setSeed(seed);
  }, [seed]);

  return <canvas ref={canvasRef} style={style} />;
};
