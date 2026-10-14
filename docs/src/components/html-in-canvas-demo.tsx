'use client';

import { cloneElement, isValidElement, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import type { ShaderDef } from '@/shader-defs/shader-def-types';
import { jsxToCode } from '@/helpers/jsx-to-code';
import { ShaderContainer } from './shader-container';
import { ShaderDetails } from './shader-details';

/** How the drawable div that holds the HTML is styled inside the shader, with the CSS each option puts on it */
const wrapperModes = [
  { name: 'none', css: '' },
  // The shader's own default, so the code sample leaves the prop out in this mode
  { name: '100%', css: 'width: 100%; height: 100%' },
  {
    name: '100% centered',
    css: 'width: 100%; height: 100%; display: flex; align-items: center; justify-content: center',
  },
] as const;

type WrapperMode = (typeof wrapperModes)[number]['name'];

/** Turns `a-b: c; d: e` into a React style object */
function parseCss(css: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const declaration of css.split(';')) {
    const colon = declaration.indexOf(':');
    const property = declaration.slice(0, colon).trim();
    const value = declaration.slice(colon + 1).trim();
    if (colon === -1 || !property || !value) continue;
    style[property.startsWith('--') ? property : property.replace(/-([a-z])/g, (_, char) => char.toUpperCase())] =
      value;
  }
  return style;
}

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

/** Picks the drawable div style, showing each option's CSS under its name. Sits in the controls card above Leva */
function WrapperModePanel({ mode, onChange }: { mode: WrapperMode; onChange: (mode: WrapperMode) => void }) {
  return (
    <div className="m-6 flex flex-col gap-2 rounded-lg bg-focus/10 p-4 font-mono text-[11px] ring-1 ring-focus/40 squircle:rounded-xl">
      <div className="cursor-default px-6 pt-6 pb-4 font-medium text-focus">drawable div style</div>
      {wrapperModes.map(({ name, css }) => (
        <label
          key={name}
          className="flex cursor-pointer flex-col gap-2 rounded-md px-6 py-4 transition-colors hover:bg-focus/15 has-checked:bg-focus/25 has-focus-visible:outline-2 has-focus-visible:outline-focus"
        >
          <input
            type="radio"
            name="drawable-div-style"
            className="sr-only"
            checked={mode === name}
            onChange={() => onChange(name)}
          />
          <span>{name}</span>
          <code className="text-current/60">{css || 'no styles'}</code>
        </label>
      ))}
    </div>
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
  /** The shader, which also gets the wrapper style of the chosen mode */
  children: ReactNode;
}) {
  const [wrapperMode, setWrapperMode] = useState<WrapperMode>('100%');
  const htmlWrapperStyle = parseCss(wrapperModes.find(({ name }) => name === wrapperMode)!.css);
  const sampleParams = wrapperMode === '100%' ? currentParams : { ...currentParams, htmlWrapperStyle };

  return (
    <>
      <style>{htmlContentCss}</style>
      <ShaderContainer
        shaderDef={shaderDef}
        currentParams={currentParams}
        controls={<WrapperModePanel mode={wrapperMode} onChange={setWrapperMode} />}
      >
        {isValidElement(children)
          ? cloneElement(children as ReactElement<{ htmlWrapperStyle?: CSSProperties }>, { htmlWrapperStyle })
          : children}
      </ShaderContainer>
      <RawHtmlPreview>{htmlContent}</RawHtmlPreview>
      <ShaderDetails
        shaderDef={shaderDef}
        currentParams={sampleParams}
        notes={notes}
        htmlSample={{ code: jsxToCode(htmlContent), css: htmlContentCss, defaultParams }}
      />
    </>
  );
}
