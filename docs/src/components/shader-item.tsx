'use client';

import { homeShaders } from '@/home-shaders';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function ShaderItems() {
  return homeShaders.map((shader) => <ShaderItem key={shader.name} {...shader} />);
}

export function ShaderItem({
  name,
  image,
  url,
  style,
  isStatic = false,
  ShaderComponent,
  shaderConfig,
}: {
  name: string;
  image?: StaticImageData;
  url: string;
  isStatic?: boolean;
  ShaderComponent: React.ComponentType<{ style: React.CSSProperties } & Record<string, unknown>>;
  style?: React.CSSProperties;
  shaderConfig?: Record<string, unknown>;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [showShader, setShowShader] = useState(false);

  return (
    <Link href={url} className="flex flex-col gap-2">
      <div
        className="bg-background relative aspect-4/3 overflow-hidden rounded-lg shadow-sm sm:rounded-xl"
        onMouseEnter={() => {
          // Disable shaders on small (touch) devices or static shaders to prevent choppy hover transitions.
          // On these screens, prioritize a sharp static preview over a degraded shader effect.
          if (!isStatic && window.innerWidth > 640) {
            setIsHovered(true);
            setShowShader(true);
          }
        }}
        onMouseLeave={() => setIsHovered(false)}
      >
        {image && (
          <>
            <Image
              className="absolute top-1/2 left-1/2 -mt-[112px] -ml-[150px] block h-[225px] w-[300px] max-w-none sm:-mt-[150px] sm:-ml-[200px] sm:h-[300px] sm:w-[400px]"
              src={image}
              alt={`Preview of ${name}`}
              unoptimized // The images are already optimized
              priority
            />
            {showShader && shaderConfig && (
              <ShaderComponent
                className="absolute top-1/2 left-1/2 -mt-[112px] -ml-[150px] block h-[225px] w-[300px] max-w-none sm:-mt-[150px] sm:-ml-[200px] sm:h-[300px] sm:w-[400px]"
                style={{
                  // Some shaders are transparent, adding a background to not see the preview image through
                  background: 'white',
                  opacity: isHovered ? 1 : 0,
                  transition: 'opacity 400ms ease-out',
                  ...style,
                }}
                {...shaderConfig}
                onTransitionEnd={() => {
                  if (!isHovered) {
                    setShowShader(false);
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
