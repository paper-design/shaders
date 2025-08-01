import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tartan Shader | Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
