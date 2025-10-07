import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Line Grid • Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
