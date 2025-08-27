'use client';

import Link from 'next/link';
import { GithubIcon } from '@/icons';
import { getPreviousPathname } from './save-previous-pathname';
import { useRouter } from 'next/navigation';
import { Logo } from './logo';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  return (
    <div className="relative pt-20">
      <div className="mb-16 flex w-full items-center justify-between">
        <Link
          href="/"
          className="mr-auto flex items-center gap-16 text-xl lowercase select-none"
          style={{ fontFeatureSettings: '"ss02"' }}
          onClick={(event) => {
            if (event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) {
              return;
            }

            const prev = getPreviousPathname();

            // Go back if the previous page was the homepage so that the browser can restore the scroll position
            if (prev === '/') {
              event.preventDefault();
              router.back();
            }
          }}
        >
          {/* <span>←</span> */}
          <Logo />
        </Link>

        <Link href="https://github.com/paper-design/shaders" target="_blank" className="ml-auto hidden xs:flex">
          <GithubIcon className="size-28" />
        </Link>
      </div>

      {/* {title && (
        <h1 className="top-6.5 left-1/2 -mt-1 text-3xl font-medium lowercase sm:text-4xl lg:absolute lg:-translate-x-1/2 lg:text-3xl">
          {title}
        </h1>
      )} */}
    </div>
  );
};
