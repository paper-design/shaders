import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Neuro Noise Shader • Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
