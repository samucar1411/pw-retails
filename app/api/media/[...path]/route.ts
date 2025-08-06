import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sys.adminpy.com:18001';
    const mediaPath = resolvedParams.path.join('/');
    const mediaUrl = `${API_URL}/media/${mediaPath}`;

    console.log(`Proxying media request to: ${mediaUrl}`);

    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Token ${token}`,
        'User-Agent': 'NextJS-Media-Proxy/1.0',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch media: ${response.status} ${response.statusText}`);
      console.error(`URL: ${mediaUrl}`);
      return new NextResponse(`Failed to fetch media: ${response.status} ${response.statusText}`, { 
        status: response.status 
      });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    const fileName = response.headers.get('content-disposition');
    
    const buffer = await response.arrayBuffer();
    console.log(`Media response: ${buffer.byteLength} bytes, type: ${contentType}`);

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache', // Changed for downloads
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    if (fileName) {
      headers['Content-Disposition'] = fileName;
    }

    return new NextResponse(buffer, { headers });
  } catch (error) {
    console.error('Error proxying media request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}