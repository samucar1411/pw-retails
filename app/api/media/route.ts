import { NextRequest, NextResponse } from 'next/server';
import * as https from 'https';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Create HTTPS agent that ignores SSL certificate errors
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const response = await fetch(url, {
      // @ts-expect-error - Node.js specific option
      agent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS Media Proxy)',
      }
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch media', { status: response.status });
    }

    // Get the content type from the original response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Create response headers
    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      'Access-Control-Allow-Origin': '*'
    });

    // Copy the content-length if available
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    // Stream the response body
    return new NextResponse(response.body, {
      status: 200,
      headers: responseHeaders
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new NextResponse('Failed to proxy media request', { status: 502 });
  }
}