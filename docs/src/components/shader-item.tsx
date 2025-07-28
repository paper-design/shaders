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
        className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#f7f6f0] shadow"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {image && (
          <>
            <Image
              className="absolute left-1/2 top-1/2 -ml-[200px] -mt-[150px] block h-[300px] w-[400px] max-w-none"
              src={image}
              alt={`Preview of ${name}`}
              width={400}
              height={300}
              unoptimized // The images are already optimized
              priority
            />
            {isHovered && shaderConfig && (
              <ShaderComponent
                style={{
                  width: 400,
                  height: 300,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-150px',
                  marginLeft: '-200px',
                  // Some shaders are transparent, adding a background to not see the preview image through
                  background: 'black',
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
