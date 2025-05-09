import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image filter demo | Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
