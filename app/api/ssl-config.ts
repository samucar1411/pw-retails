import https from 'https';

// Configuración de agente HTTPS para las solicitudes del lado del servidor
export const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Ignorar errores de validación de certificado SSL
});

// Opciones de fetch configuradas para ignorar errores de certificado SSL
export const fetchOptions = {
  agent: process.env.NODE_ENV !== 'production' ? httpsAgent : undefined,
};

// Función de ayuda para hacer fetch con verificación SSL deshabilitada
export async function fetchWithoutSSLVerification(url: string, options: RequestInit = {}) {
  // Combinar opciones
  const mergedOptions = {
    ...options,
    agent: httpsAgent
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    return response;
  } catch (error) {
    console.error('Error in fetchWithoutSSLVerification:', error);
    throw error;
  }
} 