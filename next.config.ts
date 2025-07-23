import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [
      'asset.cloudinary.com',
      'res.cloudinary.com',
      'sys.adminpy.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asset.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sys.adminpy.com',
        port: '18001',
        pathname: '/media/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === 'production', // Deshabilitar optimización en producción si hay problemas
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "https://sys.adminpy.com:18001",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sys.adminpy.com:18001';
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*/`,
      },
      {
        source: "/api-token-auth2",
        destination: `${API_URL}/api-token-auth2/`,
      },
      {
        source: "/auth/:path*",
        destination: `${API_URL}/auth/:path*/`,
      },
    ];
  },
  // Ignore SSL certificate errors in dev (DO NOT USE IN PROD!)
  serverRuntimeConfig: {
    https: {
      rejectUnauthorized: false
    }
  },

  webpack: (config, { dev }) => {
    if (dev) {
      // Ignore SSL certificate errors for axios/fetch in dev
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
      config.ignoreWarnings = [
        { module: /node_modules\/axios/ },
        { module: /node_modules\/https-proxy-agent/ }
      ];
    }
    return config;
  }
};

export default nextConfig;