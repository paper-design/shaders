import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blobs Grid Shader | Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
