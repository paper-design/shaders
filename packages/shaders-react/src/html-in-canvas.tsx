'use client';

import { Children, Fragment, isValidElement, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { isHtmlInCanvasSupported, observeContentSize, type ShaderSizeToContent } from '@paper-design/shaders';

const subscribeToNothing = () => () => {};
// Assumed on the server, so that supporting browsers don't re-render the canvas after hydration
const isSupportedOnServer = () => true;

/**
 * Draws the children into u_image where the browser supports it, otherwise they're shown on top of the shader.
 * A single child element is drawn as it is. Several children or text are wrapped in a div, so there's always one
 * element to draw. It lays out the same either way.
 *
 * The drawn element fills the shader, except on the axes sized to content: there it takes the size of its children,
 * and the shader follows it (see `observeContentSize`).
 */
export function useHtmlChildren(
  acceptsHtmlChildren: boolean,
  children: React.ReactNode,
  sizeToContent: ShaderSizeToContent | undefined,
  shaderRef: React.RefObject<HTMLElement | null>
): {
  hasHtmlChildren: boolean;
  content: HTMLElement | null;
  addHtmlUniform: <T extends object>(uniforms: T) => T;
  renderedChildren: React.ReactNode;
  shaderAttributes: Record<`data-${string}`, string | undefined> | undefined;
  sizeStyle: React.CSSProperties | undefined;
} {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [content, setContent] = useState<HTMLElement | null>(null);
  const isSupported = useSyncExternalStore(subscribeToNothing, isHtmlInCanvasSupported, isSupportedOnServer);
  const items = acceptsHtmlChildren ? Children.toArray(children) : [];
  const hasChildren = items.length > 0;
  const hasHtmlChildren = hasChildren && isSupported;

  const findContent = (): HTMLElement | null => {
    if (!hasChildren) {
      return null;
    }
    const element = hasHtmlChildren
      ? canvasRef.current?.firstElementChild
      : shaderRef.current?.querySelector(':scope > :not(canvas)');
    return (element as HTMLElement | null | undefined) ?? null;
  };

  // Looked up after every render, since the app can swap the child for another element
  useLayoutEffect(() => {
    const element = findContent();
    if (hasHtmlChildren) {
      element?.setAttribute('drawable', '');
    }
    if (element !== content) {
      setContent(element);
    }
  });

  useLayoutEffect(() => {
    const shader = shaderRef.current;
    if (!content || !shader || !sizeToContent) {
      return;
    }

    return observeContentSize(shader, content);
  }, [content, sizeToContent, shaderRef]);

  const addHtmlUniform = <T extends object>(uniforms: T): T => {
    const element = hasHtmlChildren ? findContent() : null;
    return element ? { ...uniforms, u_image: element } : uniforms;
  };

  if (!hasChildren) {
    return {
      hasHtmlChildren,
      content,
      addHtmlUniform,
      renderedChildren: children,
      shaderAttributes: undefined,
      sizeStyle: undefined,
    };
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

  const only = items[0];
  const isSingleElement = items.length === 1 && isValidElement(only) && only.type !== Fragment;
  const drawn = isSingleElement ? children : <div>{children}</div>;

  return {
    hasHtmlChildren,
    content,
    addHtmlUniform,
    renderedChildren: hasHtmlChildren ? (
      <canvas ref={canvasRef} {...{ content: 'drawable', layoutsubtree: '' }}>
        {drawn}
      </canvas>
    ) : (
      drawn
    ),
    shaderAttributes: { 'data-paper-shader': 'html', 'data-size-to-content': sizeToContent },
    sizeStyle,
  };
}
