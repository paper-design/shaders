import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warp shader • Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
