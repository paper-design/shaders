'use client';

import { Children, cloneElement, forwardRef, isValidElement, useRef, useSyncExternalStore, version } from 'react';
import { isHtmlInCanvasSupported } from '@paper-design/shaders';
import { useMergeRefs } from './use-merge-refs.js';

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

type HostElement = React.ReactElement<{ ref?: React.Ref<HTMLElement> }, string>;

/** Returns the only child when it's a single HTML element, which can be the drawable child itself */
function getOnlyHostElement(children: React.ReactNode): HostElement | null {
  const array = Children.toArray(children);
  const only = array[0];
  return array.length === 1 && isValidElement(only) && typeof only.type === 'string' ? (only as HostElement) : null;
}

/** The child's own ref, which moved from the element to its props in React 19 */
function getElementRef(element: HostElement): React.Ref<HTMLElement> | undefined {
  return parseInt(version) >= 19 ? element.props.ref : (element as unknown as { ref?: React.Ref<HTMLElement> }).ref;
}

/**
 * A `<canvas content="drawable">` that lays out its children so the shader can draw them into textures.
 * A single HTML element becomes the drawable child itself, so its own CSS sizes it against the canvas, like in vanilla.
 * Anything else (text, several elements, components) is wrapped in a drawable `<div>`.
 */
export const DrawableCanvas: React.ForwardRefExoticComponent<DrawableCanvasProps & React.RefAttributes<HTMLElement>> =
  forwardRef<HTMLElement, DrawableCanvasProps>(function DrawableCanvasImpl({ children }, ref) {
    const onlyElement = getOnlyHostElement(children);
    const mergedRef = useMergeRefs([ref, onlyElement ? getElementRef(onlyElement) : undefined]);

    return (
      <canvas {...{ content: 'drawable' }}>
        {onlyElement ? (
          cloneElement(onlyElement, { ref: mergedRef, drawable: '' } as object)
        ) : (
          <div ref={ref as React.Ref<HTMLDivElement>} {...{ drawable: '' }}>
            {children}
          </div>
        )}
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
  const drawableChildRef = useRef<HTMLElement>(null);
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
