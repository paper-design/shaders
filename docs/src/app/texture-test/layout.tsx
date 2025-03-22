import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Texture Test | Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
