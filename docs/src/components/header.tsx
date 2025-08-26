'use client';

import Link from 'next/link';
import { GithubIcon } from '@/icons';
import { getPreviousPathname } from './save-previous-pathname';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  return (
    <div className="relative flex w-full items-center justify-center pt-8">
      <Link
        href="/"
        className="mr-auto font-mono text-xl lowercase select-none"
        style={{ fontFeatureSettings: '"ss02"' }}
        onClick={(event) => {
          const prev = getPreviousPathname();

          // Go back if the previous page was the homepage so that the browser can restore the scroll position
          if (prev === '/') {
            event.preventDefault();
            router.back();
          }
        }}
      >
        <span className="relative top-[0.05em]">←</span> Paper Shaders
      </Link>

      {title && <h1 className="absolute mb-1.5 text-3xl font-medium lowercase">{title}</h1>}

      <Link href="https://github.com/paper-design/shaders" target="_blank" className="ml-auto">
        <GithubIcon className="size-7" />
      </Link>
    </div>
  );
};
