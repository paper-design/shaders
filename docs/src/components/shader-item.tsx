'use client';

import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function ShaderItem({
  name,
  image,
  url,
  ShaderComponent,
  shaderConfig,
}: {
  name: string;
  image: StaticImageData;
  url: string;
  ShaderComponent: React.ComponentType<{ style: React.CSSProperties } & Record<string, unknown>>;
  shaderConfig: Record<string, unknown>;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={url}
      className="flex flex-col gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className=" h-32 rounded-full overflow-hidden shadow">
        {isHovered ? (
          <ShaderComponent style={{ width: '100%', height: '100%' }} {...shaderConfig} />
        ) : (
          <Image className="size-full object-cover" src={image} alt={`Preview of ${name}`} width={640} height={360} />
        )}
      </div>
      <div className="text-center">{name}</div>
    </Link>
  );
}
