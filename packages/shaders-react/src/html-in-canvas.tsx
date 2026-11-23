'use client';

import { Children, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import {
  isHtmlInCanvasSupported,
  observeHtmlContent,
  type HtmlContentObserver,
  type ShaderSizeToContent,
} from '@paper-design/shaders';

const subscribeToNothing = () => () => {};
// Assumed on the server, so that supporting browsers don't re-render the canvas after hydration
const isSupportedOnServer = () => true;

/**
 * Draws the children into u_image where the browser supports it, otherwise they're shown on top of the shader.
 * Either way they're held by the same content element, so they lay out the same.
 *
 * The content element takes the shader's layout: its display, flex and grid styles through CSS inheritance, and its
 * padding copied over, since the canvas covers the padding. So the children lay out as if the shader held them.
 *
 * The content element fills the shader, except on the axes sized to content: there it takes the size of the children,
 * and the shader follows it (see `observeHtmlContent`).
 */
export function useHtmlChildren(
  acceptsHtmlChildren: boolean,
  children: React.ReactNode,
  sizeToContent: ShaderSizeToContent | undefined,
  shaderRef: React.RefObject<HTMLElement | null>
): {
  hasHtmlChildren: boolean;
  addHtmlUniform: <T extends object>(uniforms: T) => T;
  renderedChildren: React.ReactNode;
  shaderAttributes: Record<`data-${string}`, string | undefined> | undefined;
  sizeStyle: React.CSSProperties | undefined;
} {
  const contentRef = useRef<HTMLDivElement>(null);
  const isSupported = useSyncExternalStore(subscribeToNothing, isHtmlInCanvasSupported, isSupportedOnServer);
  const hasChildren = acceptsHtmlChildren && Children.toArray(children).length > 0;
  const hasHtmlChildren = hasChildren && isSupported;

  const observerRef = useRef<HtmlContentObserver | null>(null);

  useLayoutEffect(() => {
    const shader = shaderRef.current;
    const content = contentRef.current;
    if (!shader || !content) {
      return;
    }
    const observer = observeHtmlContent(shader, content, sizeToContent);
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [hasChildren, hasHtmlChildren, sizeToContent, shaderRef]);

  // After every render, since a style or class change can change the padding without resizing anything
  useLayoutEffect(() => {
    observerRef.current?.update();
  });

  const addHtmlUniform = <T extends object>(uniforms: T): T =>
    hasHtmlChildren && contentRef.current ? { ...uniforms, u_image: contentRef.current } : uniforms;

  if (!hasChildren) {
    return { hasHtmlChildren, addHtmlUniform, renderedChildren: children, shaderAttributes: undefined, sizeStyle: undefined };
  }

  const fitsWidth = sizeToContent === 'width' || sizeToContent === 'both';
  const fitsHeight = sizeToContent === 'height' || sizeToContent === 'both';

  // The shader takes the measured content size
  let sizeStyle: React.CSSProperties | undefined;
  if (fitsWidth || fitsHeight) {
    sizeStyle = {};
    if (fitsWidth) {
      sizeStyle.width = 'var(--paper-shader-content-width)';
    }
    if (fitsHeight) {
      sizeStyle.height = 'var(--paper-shader-content-height)';
    }
  }

  const content = (
    <div ref={contentRef} {...{ drawable: '' }}>
      {children}
    </div>
  );

  return {
    hasHtmlChildren,
    addHtmlUniform,
    renderedChildren: hasHtmlChildren ? (
      <canvas {...{ content: 'drawable', layoutsubtree: '' }} style={{ display: 'inherit' }}>
        {content}
      </canvas>
    ) : (
      content
    ),
    shaderAttributes: { 'data-paper-shader': 'html', 'data-size-to-content': sizeToContent },
    sizeStyle,
  };
}
