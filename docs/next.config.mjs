// @ts-check

/**
 * @type {import('next').NextConfig}
 */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  rewrites: async () => [
    {
      source: '/registry/:path*',
      destination: '/r/:path*.json',
    },
  ],
};

export default config;
