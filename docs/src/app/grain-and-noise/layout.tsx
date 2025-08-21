import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Grain And Noise Shader | Paper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
