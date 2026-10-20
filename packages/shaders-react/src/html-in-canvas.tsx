'use client';

import { Children, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { isHtmlInCanvasSupported } from '@paper-design/shaders';
import { useMergeRefs } from './use-merge-refs.js';

const subscribeToNothing = () => () => {};
// Assumed on the server, so that supporting browsers don't re-render the canvas after hydration
const isSupportedOnServer = () => true;

/** Props of the element that holds the children. It's what gets drawn, so it takes their layout and the visuals */
export type ShaderContentProps = React.ComponentProps<'div'> & { [key: `data-${string}`]: unknown };

/** Axes on which the shader takes the size of its content instead of its own size styles */
export type ShaderSizeToContent = 'width' | 'height' | 'both';

function hasChildren(children: React.ReactNode): boolean {
  return Children.toArray(children).length > 0;
}

export function willDrawHtmlChildren(children: React.ReactNode): boolean {
  return hasChildren(children) && isHtmlInCanvasSupported();
}

/**
 * Draws the children into u_image where the browser supports it, otherwise they're shown on top of the shader.
 * Either way they're held by the same content element, so they lay out the same.
 *
 * The content element fills the shader, except on the axes sized to content: there it takes the size of the children,
 * and the shader follows it. The canvas can't be sized by what's inside it, so the content size is measured and
 * set on the shader element. Resize observer callbacks run before paint, so this settles within the same frame.
 */
export function useHtmlChildren(
  acceptsHtmlChildren: boolean,
  children: React.ReactNode,
  contentProps: ShaderContentProps | undefined,
  sizeToContent: ShaderSizeToContent | undefined,
  shaderRef: React.RefObject<HTMLElement | null>
): {
  hasHtmlChildren: boolean;
  addHtmlUniform: <T extends object>(uniforms: T) => T;
  renderedChildren: React.ReactNode;
  sizeStyle: React.CSSProperties | undefined;
} {
  const contentRef = useRef<HTMLDivElement>(null);
  const mergedContentRef = useMergeRefs([contentRef, contentProps?.ref]);
  const isSupported = useSyncExternalStore(subscribeToNothing, isHtmlInCanvasSupported, isSupportedOnServer);
  const isWrapped = acceptsHtmlChildren && hasChildren(children);
  const hasHtmlChildren = isWrapped && isSupported;

  const fitsWidth = isWrapped && (sizeToContent === 'width' || sizeToContent === 'both');
  const fitsHeight = isWrapped && (sizeToContent === 'height' || sizeToContent === 'both');

  useLayoutEffect(() => {
    const content = contentRef.current;
    const shader = shaderRef.current;
    if (!content || !shader || (!fitsWidth && !fitsHeight)) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const size = entry?.borderBoxSize[0];
      if (!size) return;
      shader.style.setProperty('--paper-shader-content-width', `${size.inlineSize}px`);
      shader.style.setProperty('--paper-shader-content-height', `${size.blockSize}px`);
    });
    observer.observe(content);

    return () => {
      observer.disconnect();
    };
  }, [fitsWidth, fitsHeight, hasHtmlChildren, shaderRef]);

  const addHtmlUniform = <T extends object>(uniforms: T): T =>
    hasHtmlChildren && contentRef.current ? { ...uniforms, u_image: contentRef.current } : uniforms;

  if (!isWrapped) {
    return { hasHtmlChildren, addHtmlUniform, renderedChildren: children, sizeStyle: undefined };
  }

  // Sized to content: the content element takes the size of the children, which can overflow the canvas
  const contentStyle: React.CSSProperties = { ...contentProps?.style };
  if (fitsWidth) {
    contentStyle.width = 'max-content';
  }
  if (fitsHeight) {
    contentStyle.height = 'auto';
  }

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
    <div {...contentProps} ref={mergedContentRef} style={contentStyle} {...{ drawable: '' }}>
      {children}
    </div>
  );

  return {
    hasHtmlChildren,
    addHtmlUniform,
    renderedChildren: hasHtmlChildren ? (
      <canvas {...{ content: 'drawable', layoutsubtree: '' }}>{content}</canvas>
    ) : (
      content
    ),
    sizeStyle,
  };
}
