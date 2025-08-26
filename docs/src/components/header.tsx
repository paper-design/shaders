'use client';

import Link from 'next/link';
import { GithubIcon } from '@/icons';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <div className="relative mx-auto mb-4 flex w-full items-center justify-center px-8 py-8 md:px-12 lg:max-w-[1280px] lg:px-24">
      <Link href="/" className="mr-auto font-mono text-xl lowercase" style={{ fontFeatureSettings: '"ss02"' }}>
        ← <span className="-mr-[0.2em]">Paper</span> Shaders
      </Link>

      {title && <h1 className="absolute text-3xl font-medium lowercase">{title}</h1>}

      <Link href="https://github.com/paper-design/shaders" target="_blank" className="ml-auto">
        <GithubIcon className="size-7" />
      </Link>
    </div>
  );
};
// lg:max-w-[1280px] lg:px-24 2xl:max-w-[1664px]
