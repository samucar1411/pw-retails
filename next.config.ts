import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sys.adminpy.com",
        port: "18001",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/api/portraits/**",
      },
    ],
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
    return [
      {
        source: "/api/:path*",
        destination: "https://sys.adminpy.com:18001/api/:path*/",
        // Configuración para manejar problemas de SSL
        basePath: false,
      },
      {
        source: "/api-token-auth",
        destination: "https://sys.adminpy.com:18001/api-token-auth/",
        // Configuración para manejar problemas de SSL
        basePath: false,
      },
    ];
  },
  // Configuración para manejar problemas de SSL tanto en cliente como en servidor
  serverRuntimeConfig: {
    https: {
      rejectUnauthorized: false,
    },
  },
  publicRuntimeConfig: {
    https: {
      rejectUnauthorized: false,
    },
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.ignoreWarnings = [
        { module: /node_modules\/axios/ },
        { module: /node_modules\/https-proxy-agent/ },
      ];
    }
    return config;
  },
};

export default nextConfig;
