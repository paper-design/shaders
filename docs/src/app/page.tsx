'use client';

import { StaticImageData } from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homeShaders } from './home-shaders';
import { GithubIcon } from '@/icons';
import { CopyButton } from '@/components/copy-button';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <>
      <div className="mx-auto px-8 pt-5 pb-24 md:px-12 lg:max-w-[1280px] lg:px-24 2xl:max-w-[1664px]">
        <div className="mb-16 flex w-full items-center justify-between sm:mb-12 md:mb-8">
          <Link className="flex" href="https://paper.design/" target="_blank">
            <Logo />
          </Link>

          <Link href="https://github.com/paper-design/shaders" target="_blank">
            <GithubIcon className="size-7" />
          </Link>
        </div>

        <div className="mx-auto mb-2 flex flex-col items-center gap-2 text-center">
          <h1
            className="font-mono text-3xl font-medium lowercase xs:text-4xl"
            style={{ fontFeatureSettings: '"ss02"' }}
          >
            <span className="-mr-[0.2em]">Paper</span> Shaders
          </h1>
          <p className="max-w-64 text-lg text-stone-600">ultra fast zero-dependency shaders for your designs</p>
        </div>

        <div className="mx-auto mt-5 flex h-12 w-fit max-w-full items-center rounded-lg border bg-white font-mono text-sm text-nowrap text-stone-800 sm:text-base">
          <div className="no-scrollbar flex h-full w-full items-center overflow-x-scroll overscroll-y-none px-4">
            npm i @paper-design/react-shaders
          </div>
          <CopyButton
            className="hidden size-12 shrink-0 items-center justify-center border-l xs:flex"
            text="npm i @paper-design/react-shaders"
          />
        </div>
      </div>

      <main className="pb-16 text-lg">
        <div className="mx-auto px-8 md:px-12 lg:max-w-[1280px] lg:px-24 2xl:max-w-[1664px]">
          <div className="grid grid-cols-1 gap-8 xs:grid-cols-2 md:gap-12 lg:grid-cols-3 xl:gap-16 2xl:grid-cols-4">
            {homeShaders.map((shader) => (
              <ShaderItem key={shader.name} {...shader} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

function ShaderItem({
  name,
  image,
  url,
  style,
  shaderConfig,
  ShaderComponent,
}: {
  name: string;
  image?: StaticImageData;
  url: string;
  ShaderComponent: React.ComponentType<{ style: React.CSSProperties } & Record<string, unknown>>;
  style?: React.CSSProperties;
  shaderConfig?: Record<string, unknown>;
}) {
  const [shaderVisibility, setShaderVisibility] = useState<'hidden' | 'visible' | 'fading-out'>('hidden');

  return (
    <Link href={url} className="flex flex-col gap-2">
      <div
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-cream/50 will-change-transform supports-[corner-shape:squircle]:rounded-4xl"
        style={{ cornerShape: 'squircle' } as React.CSSProperties}
        onTouchStart={() => setShaderVisibility('visible')}
        onTouchEnd={() => setShaderVisibility('fading-out')}
        onTouchCancel={() => setShaderVisibility('fading-out')}
        onPointerEnter={(event) => {
          if (event.pointerType !== 'touch') {
            setShaderVisibility('visible');
          }
        }}
        onPointerLeave={(event) => {
          if (event.pointerType !== 'touch') {
            setShaderVisibility('fading-out');
          }
        }}
      >
        {image && (
          <>
            <Image
              className="absolute aspect-[4/3] h-full w-full"
              src={image}
              alt={`Preview of ${name}`}
              unoptimized // The images are already optimized
              priority
            />
            {shaderVisibility !== 'hidden' && shaderConfig && shaderConfig.speed !== 0 && (
              <ShaderComponent
                data-visibility={shaderVisibility}
                className="absolute aspect-[4/3] h-full w-full"
                style={{
                  opacity: shaderVisibility === 'fading-out' ? 0 : 1,
                  filter: shaderVisibility === 'fading-out' ? 'blur(4px)' : 'none',
                  transitionProperty: 'opacity, filter',
                  transitionDuration: '300ms',
                  transitionTimingFunction: 'ease-out',
                  ...style,
                }}
                {...shaderConfig}
                // Match the screenshot sizes
                worldWidth={400}
                worldHeight={300}
                fit="contain"
                onTransitionEnd={() => {
                  if (shaderVisibility === 'fading-out') {
                    setShaderVisibility('hidden');
                  }
                }}
              />
            )}
          </>
        )}
      </div>
      <div className="text-center">{name}</div>
    </Link>
  );
}
