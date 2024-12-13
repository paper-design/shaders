'use client';

import Image, { StaticImageData } from 'next/image';
import { useState } from 'react';

export function ShaderThumbnail({ name, image }: { name: string; image: StaticImageData }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <Image
        className="rounded-full h-32 object-cover"
        src={image}
        alt={`Preview of ${name}`}
        width={640}
        height={360}
      />
      <div className="text-center">{name}</div>
    </div>
  );
}
