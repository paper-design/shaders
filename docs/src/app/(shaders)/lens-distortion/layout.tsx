import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lens Distortion • Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
