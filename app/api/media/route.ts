import { NextRequest, NextResponse } from 'next/server';
import * as https from 'https';
import { Readable } from 'stream';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url', { status: 400 });
  }

  return new Promise<NextResponse>((resolve) => {
    https.get(url, { rejectUnauthorized: false }, (response) => {
      const contentType = response.headers['content-type'] ?? 'application/octet-stream';
      const headers = new Headers();
      headers.set('content-type', contentType);

      // Convertimos IncomingMessage a ReadableStream usando Node.js stream.wrap()
      const nodeStream = new Readable().wrap(response);

      resolve(new NextResponse(nodeStream as any, { headers }));
    }).on('error', (err) => {
      console.error('Proxy image error:', err);
      resolve(new NextResponse('Image fetch failed', { status: 502 }));
    });
  });
}