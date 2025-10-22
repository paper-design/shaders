'use client';

import { appThumbnails } from '../../app-thumbnails';

export default function ThumbnailsPage() {
  return (
    <>
      {appThumbnails.slice(10, 20).map(({ ShaderComponent, shaderConfig, name }) => {
        return <ShaderComponent key={name} {...(shaderConfig as any)} speed={0} fit="contain" />;
      })}
    </>
  );
}
