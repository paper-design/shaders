import React, { useEffect, useRef } from 'react';
import { ShaderMount as ShaderMountVanilla } from '@paper-design/shaders';

export interface ShaderMountProps {
  ref?: React.RefObject<HTMLCanvasElement>;
  fragmentShader: string;
  style?: React.CSSProperties;
  uniforms?: Record<string, number | number[]>;
  webGlContextAttributes?: WebGLContextAttributes;
  speed?: number;
}

/** Params that every shader can set as part of their controls */
export type GlobalParams = Pick<ShaderMountProps, 'speed'>;

export const ShaderMount: React.FC<ShaderMountProps> = ({
  ref,
  fragmentShader,
  style,
  uniforms = {},
  webGlContextAttributes,
  speed = 1,
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
        speed
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

  return <canvas ref={canvasRef} style={style} />;
};
