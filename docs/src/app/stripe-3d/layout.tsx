import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '3d Stripe Shader | Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
