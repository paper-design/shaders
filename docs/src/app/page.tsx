import { Input } from '@/app/input';
import { ShaderItems } from '@/components/shader-item';
import { GithubIcon } from '@/icons';
import Link from 'next/link';
import { Code } from '@/app/code';

export default function Home() {
  return (
    <main className="sm:dot-pattern p-4 sm:p-6 sm:pb-24 md:px-12 lg:pt-6">
      <header className="bg-background max-w-(--breakpoint-container) container mx-auto mb-4 rounded-xl pb-4 sm:mb-6 sm:pb-[100px]">
        <div className="mb-8 flex w-full items-center justify-between p-4">
          <Link href="https://paper.design/" target="_blank" className="transition-opacity hover:opacity-70">
            <Logo />
          </Link>
          <Link
            href="https://github.com/paper-design/shaders"
            target="_blank"
            className="transition-opacity hover:opacity-70"
          >
            <GithubIcon className="size-7" />
          </Link>
        </div>

        <div className="grid grid-cols-2 px-4">
          <div className="grow text-[26px] md:text-4xl lg:text-[48px]">
            <h1 className="font-[matter] font-normal leading-tight text-[#222]">Paper Shaders</h1>
            <p className="text-muted-foreground text-balance font-light leading-tight">
              ultra fast zero-dependency <br className="hidden sm:block" /> shaders for your designs
            </p>
          </div>

          <div className="grow">
            {/* <Input /> */}
            <Code />
          </div>
        </div>
      </header>

      <div className="bg-background max-w-(--breakpoint-container) container mx-auto rounded-xl p-4 pb-6 sm:p-6 md:p-12 xl:p-24">
        <div className="grid grid-cols-2 gap-4 gap-y-8 sm:gap-16 sm:gap-x-6 md:gap-16 lg:grid-cols-3">
          <ShaderItems />
        </div>
      </div>
    </main>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className="text-foreground" aria-label="Paper">
      <path d="M17.2308 0H4V4.30775H17V17H4V4.30775H0V17V28H4.3077H17V17H28V4.30775V0H17.2308Z" fill="currentColor" />
    </svg>
  );
}
