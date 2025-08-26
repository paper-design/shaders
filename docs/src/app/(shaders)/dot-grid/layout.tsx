import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dot Grid shader • Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
