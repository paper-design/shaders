'use client';

import type { ReactNode } from 'react';
import type { ShaderDef } from '@/shader-defs/shader-def-types';
import { ShaderContainer } from './shader-container';
import { ShaderDetails } from './shader-details';
import type { HtmlSample } from './default-html';

/** Shader page with live HTML input: the code sample shows the HTML as children and only the non-default params */
export function HtmlInCanvasShaderPage({
  shaderDef,
  currentParams,
  defaultParams,
  html,
  notes,
  children,
}: {
  shaderDef: ShaderDef;
  currentParams: Record<string, unknown>;
  /** Params equal to these are left out of the code sample */
  defaultParams: Record<string, unknown>;
  html: HtmlSample;
  notes?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <ShaderContainer shaderDef={shaderDef} currentParams={currentParams}>
        {children}
      </ShaderContainer>
      <ShaderDetails
        shaderDef={shaderDef}
        currentParams={currentParams}
        notes={notes}
        html={{ code: html.code, imports: html.imports, setup: html.setup, defaultParams }}
      />
    </>
  );
}
