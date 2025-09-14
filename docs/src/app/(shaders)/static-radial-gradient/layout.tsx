import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Static Radial Gradient Shader • Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
