'use client';

import { Children, forwardRef } from 'react';

export function hasChildren(children: React.ReactNode): boolean {
  return Children.toArray(children).length > 0;
}

interface HtmlCanvasProps {
  children?: React.ReactNode;
}

/** A `<canvas layoutsubtree>` that lays out its children so they can be captured into shader textures */
export const HtmlCanvas: React.ForwardRefExoticComponent<HtmlCanvasProps & React.RefAttributes<HTMLDivElement>> =
  forwardRef<HTMLDivElement, HtmlCanvasProps>(function HtmlCanvasImpl({ children }, ref) {
    return (
      <canvas {...{ layoutsubtree: '' }}>
        <div ref={ref}>{children}</div>
      </canvas>
    );
  });
