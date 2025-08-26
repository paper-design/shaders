import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { Analytics } from '@vercel/analytics/react';
import openGraphImage from '../../public/images/opengraph-image.png';

export const metadata: Metadata = {
  title: 'Paper Shaders – Ultra-fast zero-dependency shaders',
  description: 'Shaders for you to use in your projects, as React components or GLSL.',
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
  themeColor: '#f0efe4',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-w-[320px] overflow-y-scroll antialiased">
        <div inert className="absolute top-0 right-0 left-0 -z-1 h-200 bg-linear-to-b from-cream" />

        {children}
        <Analytics />
      </body>
    </html>
  );
}
