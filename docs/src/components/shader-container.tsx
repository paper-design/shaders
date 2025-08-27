'use client';
import { Leva } from 'leva';

export function ShaderContainer({ children }: React.PropsWithChildren) {
  return (
    <div className="relative my-48 2xl:max-w-[calc(100%-332px)] 3xl:max-w-1104">
      <div className="flex aspect-4/3 *:size-full not-has-[[data-paper-shader]]:bg-cream xs:aspect-3/2 md:aspect-16/9">
        {children}
      </div>

      <div
        className="absolute top-0 -right-332 hidden min-h-full w-300 overflow-auto rounded-xl bg-[#F4F3EB] pb-4 has-[[data-leva-container]>[style*='display:none']]:hidden 2xl:block squircle:rounded-2xl"
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
                elevation1: '#e2e1d8',
                // Main background color
                elevation2: 'transparent',
                // Inputs background
                elevation3: '#dddbd2',

                // Button :active
                accent1: '#777775',
                // Buttons at rest
                accent2: '#999997',
                // Slider thumb hover
                accent3: '#777775',

                // Label and input text color
                highlight2: '#222',
                // Leva folder title
                folderTextColor: '#222',
                // Leva folder chevron and border
                folderWidgetColor: '#999997',
              },
              sizes: {
                folderTitleHeight: '28px',
                numberInputMinWidth: '6ch',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
