'use client';

import type { ReactNode } from 'react';
import type { ShaderDef } from '@/shader-defs/shader-def-types';
import { jsxToCode } from '@/helpers/jsx-to-code';
import { ShaderContainer } from './shader-container';
import { ShaderDetails } from './shader-details';

/** Shader page with live HTML input: the code sample is generated from the same markup the shader renders */
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
  /** The HTML fed to the shader, also printed in the code sample */
  html: ReactNode;
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
        html={{ code: jsxToCode(html), defaultParams }}
      />
    </>
  );
}
