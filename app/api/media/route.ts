import { NextRequest, NextResponse } from 'next/server';

// Define the agent globally to reuse connections
let httpsAgent: import('https').Agent | null = null;

async function getHttpsAgent() {
  if (!httpsAgent) {
    const { Agent } = await import('https');
    httpsAgent = new Agent({
      rejectUnauthorized: false,
      secureProtocol: 'TLS_method',
      timeout: 30000,
      keepAlive: true,
      maxSockets: 50
    });
  }
  return httpsAgent;
}

async function fetchWithSSLBypass(url: string, options: { headers?: Record<string, string> } = {}) {
  // Strategy 1: Try with custom HTTPS agent (Node.js)
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const agent = await getHttpsAgent();
      const response = await fetch(url, {
        ...options,
        // @ts-expect-error - Node.js specific
        agent: url.startsWith('https:') ? agent : undefined,
      });
      return response;
    } catch {
      // Fall through to next strategy
    }
  }

  // Strategy 2: Try with custom headers that might bypass some restrictions
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Accept': '*/*',
        'Accept-Encoding': 'identity',
        'Connection': 'close',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });
    return response;
  } catch {
    // Fall through to next strategy
  }

  // Strategy 3: Use native Node.js https module directly
  if (typeof process !== 'undefined' && process.versions?.node) {
    const https = await import('https');
    const { URL } = await import('url');
    
    return new Promise<Response>((resolve, reject) => {
      const parsedUrl = new URL(url);
      
      const requestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: options.headers || {},
        rejectUnauthorized: false,
        secureProtocol: 'TLS_method',
        timeout: 30000,
      };

      const req = https.request(requestOptions, (res) => {
        const chunks: Buffer[] = [];
        
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const response = new Response(buffer, {
            status: res.statusCode || 200,
            statusText: res.statusMessage || 'OK',
            headers: new Headers(res.headers as Record<string, string>)
          });
          resolve(response);
        });
        res.on('error', reject);
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.setTimeout(30000);
      req.end();
    });
  }

  // Final fallback - regular fetch
  return fetch(url, options);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  const transparentPixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

  try {
    const response = await fetchWithSSLBypass(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://sys.adminpy.com/',
        'Origin': 'https://sys.adminpy.com',
      },
    });

    if (!response.ok) {
      return new NextResponse(transparentPixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'Vary': 'Accept-Encoding',
      },
    });

  } catch {
    return new NextResponse(transparentPixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}