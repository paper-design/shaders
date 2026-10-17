'use client';

import type { ReactNode } from 'react';
import type { ShaderDef } from '@/shader-defs/shader-def-types';
import { jsxToCode } from '@/helpers/jsx-to-code';
import { ShaderContainer } from './shader-container';
import { ShaderDetails } from './shader-details';

/** TEMPORARY: the same HTML placed straight into the page flow, with no shader, wrapper or canvas, to compare against */
function RawHtmlPreview({ children }: { children: ReactNode }) {
  return (
    <>
      <h2 className="mt-48 mb-12 text-base text-current/70">Raw HTML, not drawn by the shader (temporary)</h2>
      {/* Mid gray, so both light and dark content shows against it */}
      <section className="bg-[gray]">{children}</section>
    </>
  );
}

/** Shader demo with live HTML input: the code sample is generated from the same markup the shader renders */
export function HtmlInCanvasDemo({
  shaderDef,
  currentParams,
  defaultParams,
  htmlContent,
  htmlContentCss,
  notes,
  children,
}: {
  shaderDef: ShaderDef;
  currentParams: Record<string, unknown>;
  /** Params equal to these are left out of the code sample */
  defaultParams: Record<string, unknown>;
  /** The HTML fed to the shader, also printed in the code sample */
  htmlContent: ReactNode;
  /** The stylesheet for the HTML, printed as its own file in the code sample */
  htmlContentCss: string;
  notes?: ReactNode;
  /** The shader */
  children: ReactNode;
}) {
  return (
    <>
      <style>{htmlContentCss}</style>
      <ShaderContainer shaderDef={shaderDef} currentParams={currentParams}>
        {children}
      </ShaderContainer>
      <RawHtmlPreview>{htmlContent}</RawHtmlPreview>
      <ShaderDetails
        shaderDef={shaderDef}
        currentParams={currentParams}
        notes={notes}
        htmlSample={{ code: jsxToCode(htmlContent), css: htmlContentCss, defaultParams }}
      />
    </>
  );
}
