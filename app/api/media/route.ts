import { NextRequest, NextResponse } from 'next/server';

// Define the agent globally to reuse connections
let httpsAgent: import('https').Agent | null = null;

async function getHttpsAgent() {
  if (!httpsAgent) {
    const { Agent } = await import('https');
    httpsAgent = new Agent({
      rejectUnauthorized: false,
      requestCert: false,
      secureProtocol: 'TLS_method',
      timeout: 30000,
      keepAlive: true,
      maxSockets: 50,
      checkServerIdentity: () => undefined, // Disable hostname verification
    });
  }
  return httpsAgent;
}

async function fetchWithSSLBypass(url: string, options: { headers?: Record<string, string> } = {}) {
  console.log('🔄 Starting SSL bypass fetch for:', url);
  
  // Strategy 1: Use native Node.js https module directly with SSL bypass
  if (typeof process !== 'undefined' && process.versions?.node) {
    console.log('🔧 Trying Node.js HTTPS module with SSL bypass');
    try {
      const https = await import('https');
      const { URL } = await import('url');
      
      return await new Promise<Response>((resolve, reject) => {
        const parsedUrl = new URL(url);
        
        const requestOptions = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'GET',
          headers: {
            ...(options.headers || {}),
            'Accept': 'image/*,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          rejectUnauthorized: false,
          requestCert: false,
          agent: false,
          timeout: 30000,
        };

        console.log('📞 Making request to:', parsedUrl.hostname, 'with options:', {
          ...requestOptions,
          headers: Object.keys(requestOptions.headers || {})
        });

        const req = https.request(requestOptions, (res) => {
          console.log('📡 Got response status:', res.statusCode, res.statusMessage);
          const chunks: Buffer[] = [];
          
          res.on('data', (chunk) => {
            chunks.push(chunk);
          });
          
          res.on('end', () => {
            const buffer = Buffer.concat(chunks);
            console.log('📄 Response complete, size:', buffer.length, 'bytes');
            
            const headers = new Headers();
            Object.entries(res.headers).forEach(([key, value]) => {
              if (value) {
                headers.set(key, Array.isArray(value) ? value.join(', ') : value.toString());
              }
            });
            
            const response = new Response(buffer, {
              status: res.statusCode || 200,
              statusText: res.statusMessage || 'OK',
              headers
            });
            resolve(response);
          });
          
          res.on('error', (error) => {
            console.log('❌ Response error:', error);
            reject(error);
          });
        });

        req.on('error', (error) => {
          console.log('❌ Request error:', error);
          reject(error);
        });
        
        req.on('timeout', () => {
          console.log('⏰ Request timeout');
          req.destroy();
          reject(new Error('Request timeout'));
        });
        
        req.setTimeout(30000);
        req.end();
      });
    } catch (error) {
      console.log('❌ Node.js HTTPS strategy failed:', error);
      // Fall through to next strategy
    }
  }

  // Strategy 2: Try with custom HTTPS agent (Node.js)
  if (typeof process !== 'undefined' && process.versions?.node) {
    console.log('🔧 Trying custom HTTPS agent');
    try {
      const agent = await getHttpsAgent();
      const response = await fetch(url, {
        ...options,
        // @ts-expect-error - Node.js specific
        agent: url.startsWith('https:') ? agent : undefined,
      });
      console.log('✅ Custom agent strategy succeeded');
      return response;
    } catch (error) {
      console.log('❌ Custom agent strategy failed:', error);
    }
  }

  // Strategy 3: Try with custom headers
  console.log('🔧 Trying custom headers strategy');
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
    console.log('✅ Custom headers strategy succeeded');
    return response;
  } catch (error) {
    console.log('❌ Custom headers strategy failed:', error);
  }

  // Final fallback - regular fetch
  console.log('🔧 Trying regular fetch as fallback');
  try {
    const response = await fetch(url, options);
    console.log('✅ Regular fetch succeeded');
    return response;
  } catch (error) {
    console.log('❌ All strategies failed, throwing error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  console.log('🔍 Media proxy request for:', url);
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

    console.log('📡 Response status:', response.status, response.statusText);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.log('❌ Response not OK, returning transparent pixel');
      return new NextResponse(transparentPixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();
    console.log('✅ Successfully fetched image, size:', imageBuffer.byteLength, 'bytes');

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
        'Vary': 'Accept-Encoding',
      },
    });

  } catch (error) {
    console.log('💥 Error fetching image:', error);
    return new NextResponse(transparentPixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}