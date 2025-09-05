'use client';
import { Leva } from 'leva';

export function ShaderContainer({ children }: React.PropsWithChildren) {
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
      </div>
    </div>
  );
}
