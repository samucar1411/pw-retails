import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Multiple fallback approaches for SSL issues
    let response: Response | null = null;
    let lastError: Error | null = null;

    // Approach 1: Try with fetch and custom agent (Node.js environments)
    if (typeof process !== 'undefined' && process.env.NODE_ENV) {
      try {
        const https = await import('https');
        const agent = new https.Agent({
          rejectUnauthorized: false,
          timeout: 10000,
        });

        response = await fetch(url, {
          // @ts-expect-error - Node.js specific option
          agent: agent,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS Media Proxy)',
            'Accept': 'image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
          },
          timeout: 10000,
        });
      } catch (error) {
        lastError = error as Error;
        console.warn('Fetch with agent failed:', error);
      }
    }

    // Approach 2: Try with standard fetch (for edge runtime or as fallback)
    if (!response || !response.ok) {
      try {
        response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS Media Proxy)',
            'Accept': 'image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
          },
          // Disable SSL verification in headers if possible
          // @ts-expect-error - Experimental option
          rejectUnauthorized: false,
        });
      } catch (error) {
        lastError = error as Error;
        console.warn('Standard fetch failed:', error);
      }
    }

    // Approach 3: Use node-fetch-like approach with custom implementation
    if (!response || !response.ok) {
      try {
        const https = await import('https');
        const { URL } = await import('url');
        
        const parsedUrl = new URL(url);
        
        const options = {
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || 443,
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS Media Proxy)',
            'Accept': 'image/*,*/*;q=0.8',
          },
          rejectUnauthorized: false,
          timeout: 10000,
        };

        const buffer = await new Promise<Buffer>((resolve, reject) => {
          const req = https.request(options, (res) => {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}`));
              return;
            }

            const chunks: Buffer[] = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
          });

          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Request timeout')));
          req.setTimeout(10000);
          req.end();
        });

        // Create a response-like object
        const contentType = url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)?.[1] 
          ? `image/${url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)?.[1].toLowerCase() === 'jpg' ? 'jpeg' : url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)?.[1].toLowerCase()}`
          : 'application/octet-stream';

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
            'Content-Length': buffer.length.toString(),
          },
        });
      } catch (error) {
        lastError = error as Error;
        console.warn('Node HTTPS request failed:', error);
      }
    }

    // If we have a response, process it
    if (response && response.ok) {
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      
      const responseHeaders = new Headers({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      });

      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        responseHeaders.set('Content-Length', contentLength);
      }

      return new NextResponse(response.body, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // If all approaches failed, return error with details
    console.error('All media proxy approaches failed for URL:', url, 'Last error:', lastError);
    return new NextResponse(
      `Failed to proxy media request: ${lastError?.message || 'Unknown error'}`, 
      { status: 502 }
    );

  } catch (error) {
    console.error('Media proxy error:', error);
    return new NextResponse('Failed to proxy media request', { status: 502 });
  }
}