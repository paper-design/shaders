import { BlobsGrid, type BlobsGridProps } from '@paper-design/shaders-react';

export function BlobsGridExample(props: BlobsGridProps) {
  return <BlobsGrid style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}
