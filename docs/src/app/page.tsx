import { ShaderItems } from '@/components/shader-item';
import { GithubIcon } from '@/icons';
import Image from 'next/image';
import Link from 'next/link';
import logoImg from '../../public/logo-placeholder.webp';

export default function Home() {
  return (
    <>
      <header className="bg-[#f7f6f0] pt-5 pb-24 sm:pb-32">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="flex justify-between mb-8 items-center">
            <Link
              className="flex items-center gap-1 font-semibold font-[matter] text-2xl"
              href="https://paper.design/"
              target="_blank"
            >
              <Image src={logoImg} alt="Paper" width={32} height={32} className="opacity-80 relative top-[1px]" />
              Paper
            </Link>
            <Link href="https://github.com/paper-design/shaders" target="_blank">
              <GithubIcon className="size-7" />
            </Link>
          </div>
          <div className="flex flex-col gap-2 text-center max-w-64 mx-auto">
            <h1 className="text-4xl font-bold font-[matter]">Paper Shaders</h1>
            <p className="text-lg text-gray-600">ultra fast zero-dependency shaders for your designs</p>
          </div>
        </div>
      </header>
      <main className="-mt-12 pb-16">
        <div className="container mx-auto max-w-screen-lg px-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-16 gap-x-16 gap-y-8 md:gap-y-16">
            <ShaderItems />
          </div>
        </div>
      </main>
    </>
  );
}
