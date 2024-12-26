'use client';

import { ShaderItem } from '@/components/shader-item';
import { homeShaders } from '@/home-shaders';
import { GithubIcon } from '@/icons';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <header className="bg-[#f7f6f0] pt-5 pb-32">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="flex justify-between mb-5 items-center">
            <div className="font-semibold text-xl">Paper</div>
            <Link href="https://github.com/paper-design/shaders" target="_blank">
              <GithubIcon className="size-8" />
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-center max-w-64 mx-auto">
            <h1 className="text-4xl font-bold">Paper Shaders</h1>
            <p className="text-lg text-gray-600">ultra fast zero-dependency shaders for your designs</p>
          </div>
        </div>
      </header>
      <main className="-mt-12 pb-16">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-16 gap-x-16 gap-y-8 md:gap-y-16">
            {homeShaders.map((shader) => (
              <ShaderItem key={shader.name} {...shader} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
