'use client';

import { StaticImageData } from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homeShaders } from './home-shaders';
import { CheckIcon, CopyIcon, GithubIcon } from '@/icons';
import { Header } from '@/components/header';
import { CopyButton } from '@/components/copy-button';

export default function Home() {
  return (
    <>
      <div inert className="absolute top-0 right-0 left-0 -z-1 h-200 bg-linear-to-b from-[#F0EFE4]" />

      <div className="mx-auto px-8 pt-5 pb-24 md:px-12 lg:max-w-[1280px] lg:px-24 2xl:max-w-[1664px]">
        <div className="mb-8 flex w-full items-center justify-between">
          <Link className="flex" href="https://paper.design/" target="_blank">
            <svg height="40" viewBox="0 0 110 40">
              <path
                d="M34.9805 30.974V9.97559H42.3299C46.6196 9.97559 49.4394 12.5254 49.4394 16.3951C49.4394 20.2648 46.6196 22.8146 42.3299 22.8146H38.4002V30.974H34.9805ZM38.4002 19.6949H42.3299C44.6098 19.6949 45.9597 18.435 45.9597 16.3951C45.9597 14.3553 44.6098 13.1254 42.3299 13.1254H38.4002V19.6949ZM49.2871 23.6245C49.2871 28.1541 52.1369 31.3039 56.2166 31.3039C58.3464 31.3039 60.2063 30.314 61.1062 28.7541V30.9739H64.376V16.245H61.1062V18.3149C60.2963 16.905 58.3464 15.915 56.2166 15.915C52.1369 15.915 49.2871 19.0648 49.2871 23.6245ZM56.8765 28.3341C54.3567 28.3341 52.5569 26.3843 52.5569 23.6245C52.5569 20.8647 54.3567 18.8848 56.8765 18.8848C59.4264 18.8848 61.2262 20.8347 61.2262 23.6245C61.2262 26.3843 59.4264 28.3341 56.8765 28.3341ZM67.0505 36.9735V16.245H70.2903V18.4948C71.1602 16.935 73.0501 15.915 75.2099 15.915C79.2896 15.915 82.1394 19.0648 82.1394 23.5945C82.1394 28.1541 79.2896 31.3039 75.2099 31.3039C73.0801 31.3039 71.1302 30.314 70.2903 28.8741V36.9735H67.0505ZM70.2003 23.5945C70.2003 26.3843 71.9701 28.3341 74.5199 28.3341C77.0698 28.3341 78.8396 26.3543 78.8396 23.5945C78.8396 20.8347 77.0698 18.8848 74.5199 18.8848C72.0001 18.8848 70.2003 20.8347 70.2003 23.5945ZM83.4049 23.6245C83.4049 28.0641 86.5247 31.3039 90.9344 31.3039C94.1331 31.3039 96.9147 29.427 97.7651 26.6233H94.4187C93.6778 27.7657 92.3991 28.4541 90.9344 28.4541C88.6245 28.4541 86.9746 26.9242 86.6747 24.4944H97.7139C97.7739 24.2244 97.8038 23.8645 97.8038 23.3545C97.8038 18.7648 95.134 15.915 90.8744 15.915C86.5547 15.915 83.4049 19.1248 83.4049 23.6245ZM94.6241 22.0946H86.7947C87.3046 20.0547 88.8345 18.7348 90.8744 18.7348C93.0042 18.7348 94.3541 19.9947 94.6241 22.0946ZM100.068 16.245V30.9739H103.308V23.4445C103.308 20.6247 104.688 19.0948 107.327 19.0948C108.167 19.0948 108.947 19.2448 109.547 19.3948V16.245C109.007 16.035 108.287 15.915 107.537 15.915C105.618 15.915 104.118 16.905 103.308 18.7348V16.245H100.068Z"
                fill="var(--color-foreground)"
              />
              <path
                d="M15.9874 7H3.99685V10.9969H15.9874V22.9874H3.99685V10.9969L0 10.9969V22.9874V32.9795H3.99685H15.9874V22.9874H25.9795V10.9969V7H15.9874Z"
                fill="var(--color-blue)"
              />
            </svg>
          </Link>

          <Link href="https://github.com/paper-design/shaders" target="_blank">
            <GithubIcon className="size-7" />
          </Link>
        </div>

        <div className="mx-auto mb-2 flex flex-col items-center gap-2 text-center">
          <h1 className="font-mono text-4xl font-[500] lowercase" style={{ fontFeatureSettings: '"ss02"' }}>
            <span className="-mr-2">Paper</span> Shaders
          </h1>
          <p className="max-w-64 text-lg text-stone-600">ultra fast zero-dependency shaders for your designs</p>
        </div>

        <div className="no-scrollbar mx-auto mt-5 flex h-12 w-fit max-w-full items-center gap-4 overflow-x-scroll rounded-lg border bg-white pl-4 font-mono text-sm text-nowrap text-stone-800 sm:text-base">
          npm i @paper-design/react-shaders
          <CopyButton
            className="sticky right-0 flex size-12 shrink-0 items-center justify-center border-l bg-white"
            text="npm i @paper-design/react-shaders"
          />
        </div>
      </div>

      <main className="pb-16 text-lg">
        <div className="mx-auto px-8 md:px-12 lg:max-w-[1280px] lg:px-24 2xl:max-w-[1664px]">
          <div className="xs:grid-cols-2 grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-3 xl:gap-16 2xl:grid-cols-4">
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
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-black will-change-transform supports-[corner-shape:squircle]:rounded-4xl"
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
