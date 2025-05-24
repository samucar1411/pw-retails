import { NextResponse } from 'next/server';
import https from 'https';

// GET /api/suspects/[id]
// Get a specific suspect by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Processing request for suspect ID: ${id}`);
    const API_URL = `https://sys.adminpy.com:18001/api/suspects/${id}/`;
    
    // Get the URL from the request to extract query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Log the request details for debugging
    console.log(`Fetching suspect with ID: ${id}`);
    console.log("Query parameters:", Object.fromEntries(searchParams.entries()));
    
    // Construct the API URL with query parameters
    let apiUrlWithParams = API_URL;
    if (searchParams.toString()) {
      apiUrlWithParams += `?${searchParams.toString()}`;
    }
    
    console.log("Proxying request to:", apiUrlWithParams);
    
    // Get authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log("Authorization header:", authHeader ? "Present" : "Missing");
    
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
    
    const response = await fetch(apiUrlWithParams, {
      method: "GET",
      headers,
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    if (!response.ok) {
      console.error(`Error fetching suspect ${id}:`, response.status, response.statusText);
      return NextResponse.json(
        { error: `Error fetching suspect with ID ${id}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`Successfully fetched suspect ${id}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in suspect ${params.id} API route:`, error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// PUT /api/suspects/[id]
// Update a specific suspect
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Processing request for suspect ID: ${id}`);
    const API_URL = `https://sys.adminpy.com:18001/api/suspects/${id}/`;
    
    console.log(`Updating suspect with ID: ${id}`);
    
    // Get authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    console.log("Authorization header:", authHeader ? "Present" : "Missing");
    
    const body = await request.json();
    
    // Don't allow updating the ID
    if ('id' in body) {
      delete body.id;
    }
    
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
    
    const response = await fetch(API_URL, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Error updating suspect ${id}:`, response.status, response.statusText, errorData);
      return NextResponse.json(
        { error: `Error updating suspect with ID ${id}`, details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`Successfully updated suspect ${id}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in suspect update API route:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/suspects/[id]
// Delete a specific suspect
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(`Processing request for suspect ID: ${id}`);
    const API_URL = `https://sys.adminpy.com:18001/api/suspects/${id}/`;
    
    console.log(`Deleting suspect with ID: ${id}`);
    
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
    
    const response = await fetch(API_URL, {
      method: "DELETE",
      headers,
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
    });
    
    if (!response.ok) {
      console.error(`Error deleting suspect ${id}:`, response.status, response.statusText);
      return NextResponse.json(
        { error: `Error deleting suspect with ID ${id}` },
        { status: response.status }
      );
    }
    
    console.log(`Successfully deleted suspect ${id}`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in suspect delete API route:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
