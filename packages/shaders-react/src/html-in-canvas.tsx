'use client';

import { Children, useRef, useSyncExternalStore } from 'react';
import { isHtmlInCanvasSupported } from '@paper-design/shaders';

const subscribeToNothing = () => () => {};
// Assumed on the server, so that supporting browsers don't re-render the canvas after hydration
const isSupportedOnServer = () => true;

function hasChildren(children: React.ReactNode): boolean {
  return Children.toArray(children).length > 0;
}

export function willDrawHtmlChildren(children: React.ReactNode): boolean {
  return hasChildren(children) && isHtmlInCanvasSupported();
}

/**
 * The children are wrapped in a drawable element the size of the shader, so they lay out against it
 * the same way they do as its own children when the browser can't draw them
 */
function DrawableCanvas({ children, childRef }: { children: React.ReactNode; childRef: React.Ref<HTMLDivElement> }) {
  return (
    <canvas {...{ content: 'drawable' }}>
      <div ref={childRef} style={{ width: '100%', height: '100%' }} {...{ drawable: '' }}>
        {children}
      </div>
    </canvas>
  );
}

/** Draws the children into u_image where the browser supports it, otherwise they're shown on top of the shader */
export function useHtmlChildren(
  acceptsHtmlChildren: boolean,
  children: React.ReactNode
): {
  hasHtmlChildren: boolean;
  addHtmlUniform: <T extends object>(uniforms: T) => T;
  renderedChildren: React.ReactNode;
} {
  const drawableChildRef = useRef<HTMLDivElement>(null);
  const isSupported = useSyncExternalStore(subscribeToNothing, isHtmlInCanvasSupported, isSupportedOnServer);
  const hasHtmlChildren = acceptsHtmlChildren && isSupported && hasChildren(children);

  const addHtmlUniform = <T extends object>(uniforms: T): T =>
    hasHtmlChildren && drawableChildRef.current ? { ...uniforms, u_image: drawableChildRef.current } : uniforms;

  const renderedChildren = hasHtmlChildren ? (
    <DrawableCanvas childRef={drawableChildRef}>{children}</DrawableCanvas>
  ) : (
    children
  );

  return { hasHtmlChildren, addHtmlUniform, renderedChildren };
}
