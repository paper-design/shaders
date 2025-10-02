'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HomeShaderConfig, homeThumbnails } from './home-thumbnails';
import { GithubIcon } from '@/icons';
import { CopyButton } from '@/components/copy-button';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="mx-auto box-content max-w-1104 px-16 xs:px-24 sm:px-32 md:px-48 2xl:max-w-1472">
      <div className="pt-20 pb-64">
        <div className="mb-64 flex w-full items-center justify-between sm:mb-48 md:mb-32">
          <Link
            className="-mx-6 flex px-6 outline-0 outline-offset-2 outline-focus focus-visible:rounded-sm focus-visible:outline-2"
            href="https://paper.design/"
            target="_blank"
          >
            <Logo />
          </Link>

          <Link
            className="flex outline-0 outline-offset-4 outline-focus focus-visible:rounded-full focus-visible:outline-2"
            href="https://github.com/paper-design/shaders"
            target="_blank"
          >
            <GithubIcon className="size-28" />
          </Link>
        </div>

        <div className="mx-auto mb-8 flex flex-col items-center gap-8 text-center">
          <h1
            className="text-3xl font-light lowercase xs:text-4xl"
            style={{ fontFeatureSettings: '"ss01"', wordSpacing: '0.1em' }}
          >
            Paper Shaders
          </h1>
          <p className="max-w-256 text-lg text-current/70">ultra fast zero-dependency shaders for your designs</p>
        </div>

        <div className="mx-auto mt-20 flex h-48 w-fit max-w-full items-center rounded-lg border border-current/20 bg-white font-mono text-sm text-nowrap sm:text-base dark:bg-[#111]">
          <div className="no-scrollbar flex h-full w-full items-center overflow-x-scroll overscroll-y-none px-16">
            npm i @paper-design/shaders-react
          </div>
          <div className="h-full shrink-0 border-l border-current/20" />
          <CopyButton
            className="hidden h-full w-48 shrink-0 items-center justify-center rounded-r-[inherit] outline-0 outline-focus focus-visible:outline-2 xs:flex"
            getText={() => 'npm i @paper-design/shaders-react'}
          />
        </div>
      </div>

      <main className="flex flex-col gap-48 pb-128">
        {homeThumbnails.map((category) => (
          <div key={category.name}>
            <h2 className="mb-24 text-2xl font-light lowercase sm:mb-32 sm:text-3xl">{category.name}</h2>
            <div className="grid grid-cols-1 gap-32 text-lg xs:grid-cols-2 md:gap-48 lg:grid-cols-3 2xl:grid-cols-4 3xl:gap-64">
              {category.shaders.map((shader) => (
                <ShaderItem key={shader.name} {...shader} />
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

function ShaderItem({
  name,
  image,
  url,
  pixelated,
  shaderConfig,
  ShaderComponent,
  alwaysLivePreview,
}: HomeShaderConfig) {
  const [shaderVisibility, setShaderVisibility] = useState<'hidden' | 'visible' | 'fading-out'>('hidden');

  return (
    <Link href={url} className="group flex flex-col gap-8 outline-0">
      <div
        data-pixelated={pixelated ? '' : undefined}
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-header/50 outline-offset-4 outline-focus will-change-transform group-focus-visible:outline-2 data-pixelated:pixelated squircle:rounded-4xl"
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
        {...(alwaysLivePreview && {
          style: { background: `${shaderConfig.colorBack ?? 'black'} url(${image.src}) center/cover` },
        })}
      >
        {alwaysLivePreview ? (
          <ShaderComponent
            className="absolute aspect-[4/3] h-full w-full"
            {...shaderConfig}
            speed={0}
            worldWidth={400}
            worldHeight={300}
            fit="contain"
          />
        ) : (
          <Image
            className="absolute aspect-[4/3] h-full w-full"
            src={image}
            alt={`Preview of ${name}`}
            unoptimized // The images are already optimized
            priority
          />
        )}

        {shaderVisibility !== 'hidden' && shaderConfig.speed !== 0 && (
          <ShaderComponent
            className="absolute aspect-[4/3] h-full w-full"
            style={{
              opacity: shaderVisibility === 'fading-out' ? 0 : 1,
              filter: shaderVisibility === 'fading-out' ? 'blur(4px)' : 'none',
              transitionProperty: 'opacity, filter',
              transitionDuration: '100ms',
              transitionTimingFunction: 'ease-out',
            }}
            {...shaderConfig}
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
      </div>
      <div className="text-center">{name}</div>
    </Link>
  );
}
