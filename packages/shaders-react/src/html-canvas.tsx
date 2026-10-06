'use client';

import { Children, forwardRef, useRef } from 'react';

export function hasChildren(children: React.ReactNode): boolean {
  return Children.toArray(children).length > 0;
}

interface HtmlCanvasProps {
  children?: React.ReactNode;
}

/** A `<canvas content="drawable">` that lays out its children so they can be captured into shader textures */
export const HtmlCanvas: React.ForwardRefExoticComponent<HtmlCanvasProps & React.RefAttributes<HTMLDivElement>> =
  forwardRef<HTMLDivElement, HtmlCanvasProps>(function HtmlCanvasImpl({ children }, ref) {
    return (
      <canvas {...{ content: 'drawable' }}>
        <div ref={ref}>{children}</div>
      </canvas>
    );
  });

/**
 * Passes the children to the shader as a live HTML texture in `htmlUniform`, when both are given.
 * Render `content` in place of the children.
 */
export function useHtmlTexture(
  htmlUniform: string | undefined,
  children: React.ReactNode
): {
  isHtmlTexture: boolean;
  /** Children replace the HTML uniform once they are mounted into the canvas */
  withHtmlUniform: <T extends object>(uniforms: T) => T;
  content: React.ReactNode;
} {
  const htmlRef = useRef<HTMLDivElement>(null);
  const isHtmlTexture = htmlUniform !== undefined && hasChildren(children);

  const withHtmlUniform = <T extends object>(uniforms: T): T => {
    if (htmlUniform !== undefined && isHtmlTexture && htmlRef.current) {
      return { ...uniforms, [htmlUniform]: htmlRef.current };
    }
    return uniforms;
  };

  const content = isHtmlTexture ? <HtmlCanvas ref={htmlRef}>{children}</HtmlCanvas> : children;

  return { isHtmlTexture, withHtmlUniform, content };
}
