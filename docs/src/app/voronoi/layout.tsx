import { Voronoi } from 'next';

export const metadata: Voronoi = {
  title: 'Voronoi Diagram | Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
