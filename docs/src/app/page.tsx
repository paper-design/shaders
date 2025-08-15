import { Code, Example, Install } from '@/components/code';
import { CopyButton } from '@/components/copy-button';
import { ShaderItems } from '@/components/shader-item';
import { GithubIcon } from '@/icons';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="sm:dot-pattern p-4 sm:p-6 sm:pb-24 md:px-12">
      <header className="mx-auto mb-4 max-w-[var(--width-container)] pb-4 sm:mb-6 sm:py-6 md:py-12 lg:py-12">
        {/* <div className="mb-6 flex w-full items-center justify-between p-4">
          <Link href="https://paper.design/" target="_blank">
            <Logo />
          </Link>
          <Link
            href="https://github.com/paper-design/shaders"
            target="_blank"
          >
            <GithubIcon className="text-muted-foreground size-7" />
          </Link>
        </div> */}

        <div className="grid-cols-2 items-center gap-4 px-4 sm:grid sm:gap-6 sm:px-6 md:px-12 xl:px-24">
          <div className="mb-8 text-2xl lg:mb-0 lg:text-3xl">
            <h1>Paper Shaders</h1>
            <p className="text-gray font-light text-balance">ultra fast zero-dependency shaders for your designs</p>
            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row">
              <Link
                href="https://paper.design/"
                target="_blank"
                className="bg-foreground text-background flex h-12 w-full items-center justify-center rounded-sm px-6 text-base font-medium md:w-auto"
              >
                open in Paper
              </Link>
              <Link
                href="https://github.com/paper-design/shaders"
                target="_blank"
                className="bg-gray text-background flex h-12 w-full items-center justify-center rounded-sm px-6 text-base font-medium md:w-auto"
              >
                view on Github
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col gap-2">
            <span className="lines-horizontal" />
            <span className="lines-vertical" />

            <div className="relative flex h-[48px] items-center overflow-hidden rounded-md border bg-white">
              <Code className="py-0">
                <Install />
              </Code>
              <div className="absolute top-0 right-0 bottom-0 bg-gradient-to-l from-white from-70% to-transparent">
                <CopyButton
                  className="text-muted-foreground flex h-full w-10 items-center justify-center"
                  text="npm i @paper-design/shaders-react"
                />
              </div>
            </div>

            <div className="relative flex items-center overflow-hidden rounded-md border bg-white">
              <Code>
                <Example />
              </Code>
              <div className="absolute top-0 right-0 bottom-4 bg-gradient-to-l from-white from-70% to-transparent">
                <CopyButton
                  className="text-muted-foreground flex size-10 items-center justify-center"
                  text={`import { MeshGradient } from '@paper-design/shaders-react';
                  
                  export default () => (
                    <MeshGradient
                    style={{ width: 200, height: 200 }}
                    colors={['#5100ff', '#00ff80', '#ffcc00', '#ea00ff']}
                    />
                    )`}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="card mx-auto max-w-(--width-container) p-4 pb-6 sm:p-6 md:p-12 xl:p-24">
        <div className="grid grid-cols-2 gap-4 gap-y-8 sm:gap-16 sm:gap-x-6 md:gap-16 lg:grid-cols-3">
          <ShaderItems />
        </div>
      </div>
    </main>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-label="Paper" className="text-blue">
      <path d="M17.2308 0H4V4.30775H17V17H4V4.30775H0V17V28H4.3077H17V17H28V4.30775V0H17.2308Z" fill="currentColor" />
    </svg>
  );
}
