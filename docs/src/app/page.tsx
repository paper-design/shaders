import { Code, Example, Install } from '@/components/code';
import { CopyButton } from '@/components/copy-button';
import { ShaderItems } from '@/components/shader-item';
import { GithubIcon } from '@/icons';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="sm:dot-pattern p-4 sm:p-6 sm:pb-24 md:px-12">
      <header className="card mx-auto mb-4 max-w-[var(--width-container)] sm:mb-6">
        <div className="grid-cols-2 items-center gap-4 p-4 sm:p-6 md:p-12 lg:grid xl:p-24 xl:py-14">
          <div className="mb-8 md:mb-12 md:pr-6 lg:mb-0">
            <Link href="https://paper.design/" target="_blank" className="text-foreground mb-4 flex items-center gap-2">
              <Logo className="text-blue h-[32px]" />
              <h1 className="text-xl">Paper Shaders</h1>
            </Link>
            <h2 className="text-2xl font-light text-balance">ship shaders in seconds</h2>
            <p className="text-gray text-2xl font-light text-balance">
              beautiful effects with fast performance and no bloat
            </p>
            <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row">
              <Link
                href="https://app.paper.design/"
                target="_blank"
                className="bg-foreground text-background flex h-[48px] w-full items-center justify-center rounded-sm px-6 text-base font-medium text-nowrap md:w-auto"
              >
                <Logo className="mr-2 size-4" />
                open in Paper
              </Link>
              <Link
                href="https://github.com/paper-design/shaders"
                target="_blank"
                className="text-foreground dark:bg-off-black flex h-[48px] w-full items-center justify-center rounded-sm border px-6 text-base font-medium text-nowrap md:w-auto"
              >
                <GithubIcon className="mr-2 size-4" />
                view on Github
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col gap-2">
            <div className="dark:bg-background relative flex h-[48px] items-center overflow-hidden rounded-md border bg-white">
              <Code className="flex h-full items-center py-0">
                <Install />
              </Code>
              <div className="from-background absolute top-0 right-0 bottom-0 bg-gradient-to-l from-70% to-transparent">
                <CopyButton
                  className="text-muted-foreground flex h-full w-10 items-center justify-center"
                  text="npm i @paper-design/shaders-react"
                />
              </div>
            </div>

            <div className="dark:bg-background relative flex items-center overflow-hidden rounded-md border bg-white">
              <Code>
                <Example />
              </Code>
              <div className="from-background absolute top-0 right-0 bg-gradient-to-l from-70% to-transparent">
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

function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M11 0H2.5V2.5H11V11H2.5V2.5H0V11V18H2.5H11V11H18V2.5V0H11Z" fill="currentColor" />
    </svg>
  );
}
