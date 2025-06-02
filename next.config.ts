/** @type {import('next').NextConfig} */
// cambia si tu host varía

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'sys.adminpy.com', port: '18001', pathname: '/media/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'asset.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'randomuser.me', pathname: '/api/portraits/**' },
    ],
  },

  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_TARGET}/api/:path*`,
      },
      // token clásico de DRF (si lo usas)
      { source: '/api-token-auth2', destination: `${process.env.API_TARGET}/api-token-auth2/` },
    ];
  },

  async headers() { return []; },   // ya no necesitamos CORS aquí
};

export default nextConfig;