'use client';

import { appThumbnails } from '../../app-thumbnails';

export default function ThumbnailsPage() {
  return (
    <>
      {appThumbnails.slice(20, 30).map(({ ShaderComponent, shaderConfig, name }) => {
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
