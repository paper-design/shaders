import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voronoi Diagram | Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
