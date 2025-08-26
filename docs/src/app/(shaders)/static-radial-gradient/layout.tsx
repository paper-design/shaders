import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Static Radial Gradient shader • Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
