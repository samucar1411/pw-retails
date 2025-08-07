import { NextConfig } from 'next';

// Get backend hostname from API URL for secure configuration
const getBackendHostname = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  
  try {
    const url = new URL(apiUrl);
    return url.hostname;
  } catch {
    return null;
  }
};

const backendHostname = getBackendHostname();

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    https: {
      rejectUnauthorized: false
    }
  },
  images: {
    domains: [
      'asset.cloudinary.com',
      'res.cloudinary.com',
      'res-console.cloudinary.com',
      ...(backendHostname ? [backendHostname] : [])
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
        hostname: 'res-console.cloudinary.com',
        pathname: '/**',
      },
      ...(backendHostname ? [{
        protocol: 'https' as const,
        hostname: backendHostname,
        pathname: '/media/**',
      }] : []),
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    if (!API_URL) {
      console.warn('NEXT_PUBLIC_API_URL not configured');
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*/`,
      },
      {
        source: "/api-token-auth2",
        destination: `${API_URL}/api-token-auth2/`,
      },
    ];
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