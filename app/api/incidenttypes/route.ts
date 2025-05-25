import { NextRequest, NextResponse } from "next/server";
import https from "https";

const API_BASE_URL = "https://sys.adminpy.com:18001/api/incidenttypes";

// Create a reusable HTTPS agent
const agent = new https.Agent({
  rejectUnauthorized: false
});

// Helper to add CORS headers to responses
const withCors = (response: NextResponse): NextResponse => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
};

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

async function handleRequest(request: NextRequest) {
  try {
    // Handle preflight request
    if (request.method === 'OPTIONS') {
      return withCors(new NextResponse(null, { status: 204 }));
    }

    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const apiUrl = searchParams.toString() 
      ? `${API_BASE_URL}/?${searchParams.toString()}`
      : `${API_BASE_URL}/`;

    // Clone headers from the incoming request
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'host') {
        headers.set(key, value);
      }
    });

    // Ensure proper content type for non-GET requests
    if (request.method !== 'GET' && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(apiUrl, {
      method: request.method,
      headers,
      body: request.body,
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
      // Only set next.revalidate for GET requests
      ...(request.method === 'GET' && { next: { revalidate: 60 } })
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error fetching data');
      console.error(`Error from API (${response.status}):`, errorText);
      return withCors(new NextResponse(
        JSON.stringify({ error: errorText }), 
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      ));
    }

    // For successful responses, pass through the data
    const data = await response.arrayBuffer();
    const responseHeaders = new Headers(response.headers);
    
    // Create a new response with the original data and headers
    const newResponse = new NextResponse(Buffer.from(data), {
      status: response.status,
      headers: responseHeaders
    });

    return withCors(newResponse);
  } catch (error) {
    console.error('Error in API proxy:', error);
    return withCors(new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    ));
  }
}
