'use client';
import { SerializableValue, serializeParams } from '@/helpers/url-serializer';
import { ShaderDef } from '@/shader-defs/shader-def-types';
import { Leva } from 'leva';
import { CopyButton } from './copy-button';
import { useState } from 'react';

export function ShaderContainer({
  children,
  currentParams,
  shaderDef,
}: React.PropsWithChildren<{
  currentParams?: Record<string, unknown>;
  shaderDef?: ShaderDef;
}>) {
  return (
    <div className="md:mb-24">
      {shaderDef && currentParams && (
        <div className="flex h-80 items-center justify-between border-t border-current/10 dark:border-current/20">
          <h1 className="text-3xl font-[330] lowercase">{shaderDef.name}</h1>

          <div className="hidden items-center gap-24 lg:flex">
            <CopyLinkButton
              shaderDef={shaderDef}
              currentParams={currentParams}
              className="-mx-8 flex h-32 items-center gap-8 rounded-md px-8 outline-0 outline-focus transition-colors hover:bg-backplate-2 focus-visible:outline-2 active:bg-backplate-3 squircle:rounded-lg"
            />

            <a
              href="https://app.paper.design"
              target="_blank"
              className="-mx-8 flex h-32 items-center gap-8 rounded-md px-8 outline-0 outline-focus transition-colors hover:bg-backplate-2 focus-visible:outline-2 active:bg-backplate-3 squircle:rounded-lg"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentcolor">
                <path d="M12.2041 0.0107422C13.2128 0.113003 14 0.964351 14 2V12L13.9893 12.2041C13.8938 13.1457 13.1457 13.8938 12.2041 13.9893L12 14H6V13H12C12.5523 13 13 12.5523 13 12V2C13 1.48233 12.6067 1.05623 12.1025 1.00488L12 1H2C1.48232 1 1.05621 1.39333 1.00488 1.89746L1 2V8H0V2C0 0.89543 0.89543 0 2 0H12L12.2041 0.0107422Z" />
                <path d="M8 9.5V6.5C7.99921 6.36201 7.94251 6.23434 7.85143 6.14433C7.80398 6.09744 7.74949 6.06198 7.69139 6.03794C7.63244 6.01349 7.56779 6 7.5 6H4.5C4.22386 6 4 6.22386 4 6.5C4 6.77614 4.22386 7 4.5 7H6.29289L0.146453 13.1464C-0.0488175 13.3417 -0.0488175 13.6583 0.146453 13.8536C0.341713 14.0488 0.658292 14.0488 0.853552 13.8536L7 7.70711V9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5Z" />
              </svg>

              <span>
                open <span style={{ fontFeatureSettings: '"ss01"' }}>Paper</span>
              </span>
            </a>
          </div>
        </div>
      )}

      <div className="relative">
        <ResizableShader>{children}</ResizableShader>

        <div
          className="absolute -top-4 -right-332 hidden w-300 overflow-auto rounded-xl bg-(--color-leva-background) pb-4 has-[[data-leva-container]>[style*='display:none']]:hidden lg:block squircle:rounded-2xl"
          style={{
            boxShadow: `
            rgba(58, 34, 17, 0.1) 0px 4px 40px -8px,
            rgba(58, 34, 17, 0.2) 0px 12px 20px -8px,
            rgba(58, 34, 17, 0.1) 0px 0px 0px 1px
          `,
          }}
        >
          <div className="-mb-14 cursor-default p-10 font-mono text-[11px]">Presets</div>

          <div data-leva-container>
            <Leva
              fill
              flat
              hideCopyButton
              titleBar={false}
              theme={{
                fonts: {
                  mono: 'var(--font-mono)',
                },
                colors: {
                  // Separators and slider tracks
                  elevation1: 'var(--color-leva-separators)',
                  // Main background color
                  elevation2: 'transparent',
                  // Inputs background
                  elevation3: 'var(--color-leva-input)',

                  // Button :active
                  accent1: 'var(--color-leva-control-pressed)',
                  // Buttons at rest
                  accent2: 'var(--color-leva-button)',
                  // Slider thumb hover
                  accent3: 'var(--color-leva-control-pressed)',

                  // Label and input text color
                  highlight2: 'var(--color-foreground)',
                  // Leva folder title
                  folderTextColor: 'var(--color-foreground)',
                },
                sizes: {
                  folderTitleHeight: '28px',
                  numberInputMinWidth: '7ch',
                },
              }}
            />
          </div>
          {/* <div className="flex flex-col gap-(--leva-space-colGap) border-t border-(--color-leva-separators) px-10 pt-11 pb-7 font-mono text-[11px]">
          {shaderDef && currentParams && (
            <CopyLinkButton
              currentParams={currentParams}
              shaderDef={shaderDef}
              className="cursor-pointer rounded-(--leva-radii-sm) bg-(--color-leva-button) py-4.5 text-(--leva-colors-highlight3) ring-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-(--color-leva-control-pressed)"
            />
          )}
        </div> */}
        </div>
      </div>
    </div>
  );
}

function ResizableShader({ children }: React.PropsWithChildren) {
  const [canStartResize, setCanStartResize] = useState(false);

  return (
    <div
      className="flex aspect-4/3 *:size-full *:max-h-full not-has-[[data-paper-shader]]:bg-header xs:aspect-3/2 md:aspect-16/9"
      onPointerMove={(event) => setCanStartResize(event.altKey)}
      onPointerLeave={() => setCanStartResize(false)}
    >
      <div
        data-resizable={canStartResize || undefined}
        className="flex overflow-hidden *:size-full data-resizable:resize [[style*='width']]:resize"
      >
        {children}
      </div>
    </div>
  );
}

export function CopyLinkButton({
  currentParams,
  shaderDef,
  className,
}: {
  currentParams: Record<string, unknown>;
  shaderDef: ShaderDef;
  className?: string;
}) {
  return (
    <CopyButton
      getText={() => {
        const baseUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
        const serialized = serializeParams(currentParams as Record<string, SerializableValue>, shaderDef.params);
        return `${baseUrl}#${serialized}`;
      }}
      className={className}
    >
      copy link
    </CopyButton>
  );
}
