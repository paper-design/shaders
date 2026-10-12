'use client';

import { Children, cloneElement, isValidElement, useRef, useSyncExternalStore, version } from 'react';
import { isHtmlInCanvasSupported } from '@paper-design/shaders';
import { useMergeRefs } from './use-merge-refs.js';

const subscribeToNothing = () => () => {};
// Assumed on the server, so that supporting browsers don't re-render the canvas after hydration
const isSupportedOnServer = () => true;

function hasChildren(children: React.ReactNode): boolean {
  return Children.toArray(children).length > 0;
}

export function willDrawHtmlChildren(children: React.ReactNode): boolean {
  return hasChildren(children) && isHtmlInCanvasSupported();
}

type HostElement = React.ReactElement<{ ref?: React.Ref<HTMLElement> }, string>;

/** A single element is drawn as is, so its own CSS sizes it against the canvas. `<img>` is wrapped, or it'd be a static image */
function getOnlyHostElement(children: React.ReactNode): HostElement | null {
  const array = Children.toArray(children);
  const only = array[0];
  return array.length === 1 && isValidElement(only) && typeof only.type === 'string' && only.type !== 'img'
    ? (only as HostElement)
    : null;
}

function getElementRef(element: HostElement): React.Ref<HTMLElement> | undefined {
  return parseInt(version) >= 19 ? element.props.ref : (element as unknown as { ref?: React.Ref<HTMLElement> }).ref;
}

function DrawableCanvas({ children, childRef }: { children: React.ReactNode; childRef: React.Ref<HTMLElement> }) {
  const onlyElement = getOnlyHostElement(children);
  const mergedRef = useMergeRefs([childRef, onlyElement ? getElementRef(onlyElement) : undefined]);

  return (
    <canvas {...{ content: 'drawable' }}>
      {onlyElement ? (
        cloneElement(onlyElement, { ref: mergedRef, drawable: '' } as object)
      ) : (
        <div ref={childRef as React.Ref<HTMLDivElement>} {...{ drawable: '' }}>
          {children}
        </div>
      )}
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
  const drawableChildRef = useRef<HTMLElement>(null);
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
