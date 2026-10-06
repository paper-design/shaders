'use client';

import { Children, forwardRef, useRef } from 'react';

export function hasChildren(children: React.ReactNode): boolean {
  return Children.toArray(children).length > 0;
}

interface DrawableCanvasProps {
  children?: React.ReactNode;
}

/** A `<canvas content="drawable">` that lays out its children in a drawable `<div>`, so the shader can draw them into textures */
export const DrawableCanvas: React.ForwardRefExoticComponent<DrawableCanvasProps & React.RefAttributes<HTMLDivElement>> =
  forwardRef<HTMLDivElement, DrawableCanvasProps>(function DrawableCanvasImpl({ children }, ref) {
    return (
      <canvas {...{ content: 'drawable' }}>
        <div ref={ref} {...{ drawable: '' }}>
          {children}
        </div>
      </canvas>
    );
  });

/**
 * Passes the children to the shader as a live HTML texture in `htmlUniform`, when both are given.
 * Render `renderedChildren` in place of the children.
 */
export function useDrawableChildren(
  htmlUniform: string | undefined,
  children: React.ReactNode
): {
  hasDrawableChildren: boolean;
  /** Adds the drawable child to the uniforms once it is mounted into the canvas */
  addDrawableChildUniform: <T extends object>(uniforms: T) => T;
  renderedChildren: React.ReactNode;
} {
  const drawableChildRef = useRef<HTMLDivElement>(null);
  const hasDrawableChildren = htmlUniform !== undefined && hasChildren(children);

  const addDrawableChildUniform = <T extends object>(uniforms: T): T => {
    if (htmlUniform !== undefined && hasDrawableChildren && drawableChildRef.current) {
      return { ...uniforms, [htmlUniform]: drawableChildRef.current };
    }
    return uniforms;
  };

  const renderedChildren = hasDrawableChildren ? (
    <DrawableCanvas ref={drawableChildRef}>{children}</DrawableCanvas>
  ) : (
    children
  );

  return { hasDrawableChildren, addDrawableChildUniform, renderedChildren };
}
