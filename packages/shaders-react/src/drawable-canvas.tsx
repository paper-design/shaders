'use client';

import { Children, forwardRef, useRef, useSyncExternalStore } from 'react';
import { isHtmlInCanvasSupported } from '@paper-design/shaders';

export function hasChildren(children: React.ReactNode): boolean {
  return Children.toArray(children).length > 0;
}

/** Whether the children will be drawn by the shader, rather than shown on top of it */
export function willDrawChildren(children: React.ReactNode): boolean {
  return hasChildren(children) && isHtmlInCanvasSupported();
}

const subscribeToNothing = () => () => {};
// The server renders the drawable canvas, so browsers that can draw HTML don't re-render it after hydration
const isSupportedOnServer = () => true;

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
 * Passes the children to the shader as a live HTML texture in u_image, when the shader accepts them.
 * Browsers that can't draw HTML show the children on top of the shader instead, like shaders that don't accept them.
 * Render `renderedChildren` in place of the children.
 */
export function useDrawableChildren(
  acceptsHtmlChildren: boolean,
  children: React.ReactNode
): {
  hasDrawableChildren: boolean;
  /** Adds the drawable child to the uniforms once it is mounted into the canvas */
  addDrawableChildUniform: <T extends object>(uniforms: T) => T;
  renderedChildren: React.ReactNode;
} {
  const drawableChildRef = useRef<HTMLDivElement>(null);
  const isSupported = useSyncExternalStore(subscribeToNothing, isHtmlInCanvasSupported, isSupportedOnServer);
  const hasDrawableChildren = acceptsHtmlChildren && isSupported && hasChildren(children);

  const addDrawableChildUniform = <T extends object>(uniforms: T): T => {
    if (hasDrawableChildren && drawableChildRef.current) {
      return { ...uniforms, u_image: drawableChildRef.current };
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
