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
  ShaderComponent,
  shaderConfig,
}: {
  name: string;
  image?: StaticImageData;
  url: string;
  ShaderComponent: React.ComponentType<{ style: React.CSSProperties } & Record<string, unknown>>;
  style?: React.CSSProperties;
  shaderConfig?: Record<string, unknown>;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={url} className="flex flex-col gap-2">
      <div
        className="relative h-32 overflow-hidden rounded-full bg-[#f7f6f0] shadow"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {image && (
          <>
            <Image
              className="size-full object-cover"
              src={image}
              alt={`Preview of ${name}`}
              width={640}
              height={360}
              unoptimized // The images are already optimized
              priority
            />
            {isHovered && shaderConfig && (
              <ShaderComponent
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  inset: 0,
                  // Some shaders are transparent, adding a background to not see the preview image through
                  background: 'white',
                  ...style,
                }}
                {...shaderConfig}
              />
            )}
          </>
        )}
      </div>
      <div className="text-center">{name}</div>
    </Link>
  );
}
