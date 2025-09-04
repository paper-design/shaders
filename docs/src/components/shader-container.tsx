'use client';
import { SerializableValue, serializeParams } from '@/helpers/url-serializer';
import { ShaderDef } from '@/shader-defs/shader-def-types';
import { Leva } from 'leva';
import { useState } from 'react';

export function CopyLinkButton({
  currentParams,
  shaderDef,
  className,
}: {
  currentParams: Record<string, unknown>;
  shaderDef: ShaderDef;
  className?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';
  const serialized = serializeParams(currentParams as Record<string, SerializableValue>, shaderDef.params);
  const shareUrl = `${baseUrl}#${serialized}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={isCopied ? 'Copied!' : 'Copy link to clipboard'}
      className={className}
    >
      {isCopied ? 'copied!' : 'copy link'}
    </button>
  );
}

export function ShaderContainer({
  children,
  currentParams,
  shaderDef,
}: React.PropsWithChildren<{
  currentParams?: Record<string, unknown>;
  shaderDef?: ShaderDef;
}>) {
  return (
    <div className="relative md:my-24">
      <div className="flex aspect-4/3 *:size-full not-has-[[data-paper-shader]]:bg-cream xs:aspect-3/2 md:aspect-16/9">
        {children}
      </div>

      <div
        className="absolute top-0 -right-332 hidden w-300 overflow-auto rounded-xl bg-(--color-leva-background) pb-4 has-[[data-leva-container]>[style*='display:none']]:hidden lg:block squircle:rounded-2xl"
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
        <div className="flex flex-col gap-(--leva-space-colGap) border-t border-(--color-leva-separators) px-10 pt-11 pb-7 font-mono text-[11px]">
          {shaderDef && currentParams && (
            <CopyLinkButton
              currentParams={currentParams}
              shaderDef={shaderDef}
              className="cursor-pointer rounded-(--leva-radii-sm) bg-(--color-leva-button) py-4.5 text-(--leva-colors-highlight3) ring-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-(--color-leva-control-pressed)"
            />
          )}
          <a
            href="https://paper.design"
            target="_blank"
            rel="noopener"
            className="cursor-pointer rounded-(--leva-radii-sm) bg-(--color-leva-button) py-4.5 text-center text-(--leva-colors-highlight3) ring-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:bg-(--color-leva-control-pressed)"
          >
            open Paper
          </a>
        </div>
      </div>
    </div>
  );
}
