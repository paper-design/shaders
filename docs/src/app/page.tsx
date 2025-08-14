import { Code, Example, Install } from '@/components/code';
import { ShaderItems } from '@/components/shader-item';
import { GithubIcon } from '@/icons';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="sm:dot-pattern p-4 sm:p-6 sm:pb-24 md:px-12 lg:pt-6">
      <header className="bg-background container mx-auto mb-4 max-w-[var(--width-container)] rounded-xl pb-4 sm:mb-6 sm:pb-6 md:pb-12 lg:pb-[84px]">
        <div className="mb-6 flex w-full items-center justify-between p-4">
          <Link href="https://paper.design/" target="_blank" className="transition-opacity hover:opacity-70">
            <Logo />
          </Link>
          <Link
            href="https://github.com/paper-design/shaders"
            target="_blank"
            className="transition-opacity hover:opacity-70"
          >
            <GithubIcon className="text-muted-foreground size-7" />
          </Link>
        </div>

        <div className="grid-cols-2 items-center gap-4 px-4 sm:gap-6 sm:px-6 md:px-12 lg:grid xl:px-24">
          <div className="mb-8 text-[26px] md:text-[32px] lg:mb-0 xl:text-[40px]">
            <h1 className="leading-tight font-normal text-[#222]">Paper Shaders</h1>
            <p className="text-muted-foreground leading-tight font-light text-balance">
              ultra fast zero-dependency <br className="hidden sm:block" /> shaders for your designs
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <Code copyText="npm i @paper-design/shaders-react">
              <Install />
            </Code>
            <Code
              copyText={`import { MeshGradient } from '@paper-design/shaders-react';
 
export default () => (
  <MeshGradient
    style={{ width: 200, height: 200 }}
    colors={['#5100ff', '#00ff80', '#ffcc00', '#ea00ff']}
  />
)`}
            >
              <Example />
            </Code>
          </div>
        </div>
      </header>

      <div className="bg-background container mx-auto max-w-(--width-container) rounded-xl p-4 pb-6 sm:p-6 md:p-12 xl:p-24">
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
