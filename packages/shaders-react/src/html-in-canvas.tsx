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
 * Draws the children into u_image where the browser supports it, otherwise they're shown on top of the shader.
 * Either way they're held by the same wrapper, so they lay out the same: it fills the shader
 */
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
  const isWrapped = acceptsHtmlChildren && hasChildren(children);
  const hasHtmlChildren = isWrapped && isSupported;

  const addHtmlUniform = <T extends object>(uniforms: T): T =>
    hasHtmlChildren && drawableChildRef.current ? { ...uniforms, u_image: drawableChildRef.current } : uniforms;

  if (!isWrapped) {
    return { hasHtmlChildren, addHtmlUniform, renderedChildren: children };
  }

  const wrapper = hasHtmlChildren ? (
    <div ref={drawableChildRef} {...{ drawable: '' }}>
      {children}
    </div>
  ) : (
    <div {...{ drawable: '' }}>{children}</div>
  );

  return {
    hasHtmlChildren,
    addHtmlUniform,
    renderedChildren: hasHtmlChildren ? <canvas {...{ content: 'drawable', layoutsubtree: '' }}>{wrapper}</canvas> : wrapper,
  };
}
