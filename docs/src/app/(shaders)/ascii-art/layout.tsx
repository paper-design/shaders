import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ASCII Art Filter \u2022 Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
