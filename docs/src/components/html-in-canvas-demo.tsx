'use client';

import { createContext, use, type ComponentType, type ReactNode } from 'react';
import type { ShaderDef } from '@/shader-defs/shader-def-types';
import { ShaderContainer } from './shader-container';
import { ShaderDetails } from './shader-details';

const ExampleSource = createContext({ source: '', css: '' });

export function ExampleSourceProvider({
  value,
  children,
}: {
  value: { source: string; css: string };
  children: ReactNode;
}) {
  return <ExampleSource value={value}>{children}</ExampleSource>;
}

/** Shader demo with live HTML input: the example file runs here and its source is the code sample */
export function HtmlInCanvasDemo({
  Example,
  shaderDef,
  currentParams,
  defaultParams,
  notes,
}: {
  Example: ComponentType<Record<string, unknown>>;
  shaderDef: ShaderDef;
  currentParams: Record<string, unknown>;
  /** Params equal to these are left out of the code sample */
  defaultParams: Record<string, unknown>;
  notes?: ReactNode;
}) {
  const { source, css } = use(ExampleSource);

  // Disabled Leva controls report undefined
  const definedParams = Object.fromEntries(Object.entries(currentParams).filter(([, value]) => value !== undefined));

  return (
    <>
      <ShaderContainer shaderDef={shaderDef} currentParams={currentParams}>
        {/* The example's own sizing is for pasting it into a page, here the shader fills the resizable box */}
        <Example {...definedParams} style={undefined} sizeToContent={undefined} />
      </ShaderContainer>
      <ShaderDetails
        shaderDef={shaderDef}
        currentParams={currentParams}
        notes={notes}
        htmlSample={{ source, css, defaultParams }}
      />
    </>
  );
}
