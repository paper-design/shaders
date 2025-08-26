import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Liquid Metal shader • Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
