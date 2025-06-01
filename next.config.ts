/** @type {import('next').NextConfig} */
 // cambia si tu host varía

module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'sys.adminpy.com', port: '18001', pathname: '/media/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'asset.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'randomuser.me', pathname: '/api/portraits/**' },
    ],
  },

  async rewrites() {
    return [
      { source: '/api/:path*',  destination: `${process.env.API_TARGET}/api/:path*/` },
      // token clásico de DRF (si lo usas)
      { source: '/api-token-auth2', destination: `${process.env.API_TARGET}/api-token-auth2/` },
    ];
  },

  async headers() { return []; },   // ya no necesitamos CORS aquí
};