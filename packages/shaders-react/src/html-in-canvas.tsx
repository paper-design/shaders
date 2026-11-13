'use client';

import { Children, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { isHtmlInCanvasSupported, observeContentSize, type ShaderSizeToContent } from '@paper-design/shaders';

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
 * and the shader follows it (see `observeContentSize`).
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

  const copyPadding = () => {
    const shader = shaderRef.current;
    const content = contentRef.current;
    if (!shader || !content) {
      return;
    }
    const style = getComputedStyle(shader);
    const padding = `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`;
    if (content.style.padding !== padding) {
      content.style.padding = padding;
    }
  };

  // After every render, since a style or class change can change the padding
  useLayoutEffect(copyPadding);

  // Padding can also change without a render, e.g. from a media query
  useLayoutEffect(() => {
    const shader = shaderRef.current;
    const content = contentRef.current;
    if (!shader || !content) {
      return;
    }
    const observer = new ResizeObserver(copyPadding);
    observer.observe(shader);
    observer.observe(content, { box: 'border-box' });
    return () => observer.disconnect();
  }, [hasChildren, hasHtmlChildren, shaderRef]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const shader = shaderRef.current;
    if (!content || !shader || !sizeToContent) {
      return;
    }

    return observeContentSize(shader, content);
  }, [hasChildren, hasHtmlChildren, sizeToContent, shaderRef]);

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
