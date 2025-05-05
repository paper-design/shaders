import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Water Drops Shader | Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
