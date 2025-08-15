import type { Metadata } from 'next';
import '../globals.css';
import { Analytics } from '@vercel/analytics/react';
import openGraphImage from '../../public/images/opengraph-image.png';

export const metadata: Metadata = {
  title: 'Paper Shaders – Zero-dependency ultra-fast shaders',
  description: 'Shaders for you to use in your projects, as React components or GLSL.',
  openGraph: {
    title: 'Paper Shaders – Zero-dependency ultra-fast shaders',
    description: 'Shaders for you to use in your projects, as React components or GLSL.',
    images: [{ type: 'image/png', width: 1200, height: 630, url: openGraphImage.src }],
  },
  twitter: {
    title: 'Paper Shaders – Zero-dependency ultra-fast shaders',
    description: 'Shaders for you to use in your projects, as React components or GLSL.',
    images: [{ type: 'image/png', width: 1200, height: 630, url: openGraphImage.src }],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
