import type { Metadata, Viewport } from 'next';
import '../index.css';
import { Analytics } from '@vercel/analytics/react';
import openGraphImage from '../../public/images/opengraph-image.jpg';
import { SavePreviousPathname } from '@/components/save-previous-pathname';

export const metadata: Metadata = {
  title: 'Paper Shaders – Ultra-fast zero-dependency shaders',
  description: 'Shaders for you to use in your projects, as React components or GLSL.',
  metadataBase: new URL('https://shaders.paper.design'),
  openGraph: {
    title: 'Paper Shaders – Ultra-fast zero-dependency shaders',
    description: 'Shaders for you to use in your projects, as React components or GLSL.',
    images: [{ type: 'image/png', width: 1200, height: 630, url: openGraphImage.src }],
  },
  twitter: {
    title: 'Paper Shaders – Ultra-fast zero-dependency shaders',
    description: 'Shaders for you to use in your projects, as React components or GLSL.',
    images: [{ type: 'image/png', width: 1200, height: 630, url: openGraphImage.src }],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    {
      color: '#f0efe4', // var(--color-cream)
      media: '(prefers-color-scheme: light)',
    },
    { color: '#000000', media: '(prefers-color-scheme: dark)' },
  ],
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body className="min-w-[320px] overflow-y-scroll antialiased">
        <div className="isolate min-h-dvh bg-background">
          <div inert className="absolute top-0 right-0 left-0 -z-1 h-800 bg-linear-to-b from-header" />
          {children}
        </div>
        <Analytics />
        <SavePreviousPathname />
      </body>
    </html>
  );
}
