import { PaperTexture, type PaperTextureProps } from '@paper-design/shaders-react';

export function PaperTextureExample(props: PaperTextureProps) {
  return <PaperTexture style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}
