import { Voronoi, VoronoiProps } from '@paper-design/shaders-react';

export function VoronoiExample(props: VoronoiProps) {
  return <Voronoi style={{ position: 'fixed', width: '100%', height: '100%' }} {...props} />;
}
