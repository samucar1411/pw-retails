import { NextResponse } from "next/server";
import https from "https";

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace '*' with your specific origin
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 hours
};

// Helper function to add CORS headers to responses
const withCors = (response: NextResponse): NextResponse => {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

const API_URL = "https://sys.adminpy.com:18001/api/offices/";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: "Office ID is required" },
        { status: 400 }
      );
    }

    const apiUrl = `${API_URL}${id}/`;
    console.log("Proxying request to:", apiUrl);
    
    // Get authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    // Add authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      console.error("Error from API:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Error fetching office data" }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in offices API route:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const API_URL = `https://sys.adminpy.com:18001/api/offices/${id}/`;
    
    console.log(`Proxying PUT request to: ${API_URL}`);
    
    // Extraer el token de autorización del encabezado de la solicitud entrante
    const authHeader = request.headers.get('authorization');
    console.log("Authorization header:", authHeader ? "Present" : "Missing");
    
    const body = await request.json();
    
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    // Añadir el encabezado de autorización si está presente
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const response = await fetch(API_URL, {
      method: "PUT",
      headers,
      // @ts-expect-error - Necesario para ignorar SSL en Next.js
      agent: agent,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error("Error from API:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Error updating data" }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in offices API route:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Handle preflight request
  if (request.method === 'OPTIONS') {
    return withCors(new NextResponse(null, { status: 204 }));
  }
  try {
    const id = params.id;
    const API_URL = `https://sys.adminpy.com:18001/api/offices/${id}/`;
    
    console.log(`Proxying DELETE request to: ${API_URL}`);
    
    // Extraer el token de autorización del encabezado de la solicitud entrante
    const authHeader = request.headers.get('authorization');
    console.log("Authorization header:", authHeader ? "Present" : "Missing");
    
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    
    // Añadir el encabezado de autorización si está presente
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const response = await fetch(API_URL, {
      method: "DELETE",
      headers,
      // @ts-expect-error - Necesario para ignorar SSL en Next.js
      agent: agent
    });
    
    if (!response.ok) {
      console.error("Error from API:", response.status, response.statusText);
      return withCors(NextResponse.json(
        { error: "Error deleting data" }, 
        { status: response.status }
      ));
    }
    
    return withCors(new NextResponse(null, { status: 204 }));
  } catch (error) {
    console.error("Error in offices API route:", error);
    return withCors(NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    ));
  }
}

// This is now handled by the individual route handlers
// Keeping it for backward compatibility
export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}