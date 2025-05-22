import type { NextConfig } from "next";
import https from "https";

// Crear una instancia de agente HTTPS que ignore los errores de certificado
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Ignorar errores de validación de certificado SSL
});

// Desactivar advertencias de Node.js sobre certificados inseguros
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // ¡Solo para desarrollo! Remover en producción

// Imprimir información de depuración
console.log('=== CONFIGURACIÓN DE NEXT.JS ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SSL Verification: DESHABILITADA para desarrollo');
console.log('Redirecciones de API configuradas para servidor: https://sys.adminpy.com:18001');

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
      {
        protocol: "https",
        hostname: "asset.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  env: {
    IGNORE_SSL_ERRORS: 'true', // Variable para indicar que se deben ignorar errores SSL
    API_BASE_URL: 'https://sys.adminpy.com:18001', // URL base de la API externa
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
            value: "*", // Cambiar a * para permitir cualquier origen en desarrollo
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS", // Added OPTIONS for preflight requests
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400", // Cache CORS preflight requests for 24 hours
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Redirección para autenticación
      {
        source: "/api-token-auth2/",
        destination: "https://sys.adminpy.com:18001/api-token-auth2/",
        basePath: false,
      },
      // Redirección específica para oficinas con soporte para CORS preflight
      {
        source: "/api/offices/:path*",
        destination: "https://sys.adminpy.com:18001/api/offices/:path*",
        basePath: false,
      },
      // Redirección específica para oficinas (endpoint principal)
      {
        source: "/api/offices",
        destination: "https://sys.adminpy.com:18001/api/offices",
        basePath: false,
      },
      // Redirección específica para incidentes con soporte para CORS preflight
      {
        source: "/api/incidents/:path*",
        destination: "https://sys.adminpy.com:18001/api/incidents/:path*",
        basePath: false,
      },
      // Redirección específica para incidentes por ID
      {
        source: "/api/incidents/:id",
        destination: "https://sys.adminpy.com:18001/api/incidents/:id",
        basePath: false,
      },
      // Redirección específica para incidentes (endpoint principal)
      {
        source: "/api/incidents",
        destination: "https://sys.adminpy.com:18001/api/incidents",
        basePath: false,
      },
      // Redirección específica para tipos de incidentes con soporte para CORS preflight
      {
        source: "/api/incidenttypes/:path*",
        destination: "https://sys.adminpy.com:18001/api/incidenttypes/:path*",
        basePath: false,
      },
      // Redirección específica para tipos de incidentes (endpoint principal)
      {
        source: "/api/incidenttypes",
        destination: "https://sys.adminpy.com:18001/api/incidenttypes",
        basePath: false,
      },
      // Redirección genérica para todos los endpoints de API
      {
        source: "/api/:path*",
        destination: "https://sys.adminpy.com:18001/api/:path*",
        basePath: false,
      }
    ];
  },
  // Configuración para manejar problemas de SSL tanto en cliente como en servidor
  serverRuntimeConfig: {
    https: {
      rejectUnauthorized: false,
      agent: httpsAgent
    },
  },
  publicRuntimeConfig: {
    https: {
      rejectUnauthorized: false,
    },
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.ignoreWarnings = [
        { module: /node_modules\/axios/ },
        { module: /node_modules\/https-proxy-agent/ },
      ];
    }
    
    // Configuración específica para el servidor
    if (isServer) {
      console.log('Configurando Node.js para ignorar errores de SSL en el servidor');
      
      // Intentar modificar el comportamiento del módulo https
      try {
        const originalHttpsRequest = https.request;
        https.request = function(url, options, callback) {
          if (options) {
            options.rejectUnauthorized = false;
          }
          return originalHttpsRequest(url, options, callback);
        } as typeof https.request;
      } catch (e) {
        console.error('No se pudo modificar https.request', e);
      }
    }
    
    return config;
  },
};

export default nextConfig;
