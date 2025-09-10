'use client';

import { appThumbnails } from '../../app-thumbnails';

export default function ThumbnailsPage() {
  return (
    <>
      {appThumbnails.slice(0, 10).map(({ ShaderComponent, shaderConfig, name }) => {
        return (
          <ShaderComponent
            key={name}
            style={{ borderRadius: '4px' }}
            {...(shaderConfig as any)}
            speed={0}
            fit="contain"
          />
        );
      })}
    </>
  );
}
