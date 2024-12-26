// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const config = {
  output: 'export',
  images: { unoptimized: true },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default config;
