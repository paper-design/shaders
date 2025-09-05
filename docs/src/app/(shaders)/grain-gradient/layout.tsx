import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grain Gradient • Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
