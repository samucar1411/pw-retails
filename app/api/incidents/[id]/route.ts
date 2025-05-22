import { NextResponse } from "next/server";
import https from "https";

// GET /api/incidents/[id]
// Get a specific incident by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const API_URL = `https://sys.adminpy.com:18001/api/incidents/${id}/`;
    
    // Get the URL from the request to extract query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Log the request details for debugging
    console.log(`Fetching incident with ID: ${id}`);
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
      console.error(`Error fetching incident ${id}:`, response.status, response.statusText);
      return NextResponse.json(
        { error: `Error fetching incident with ID ${id}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`Successfully fetched incident ${id}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in incident ${params.id} API route:`, error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// PUT /api/incidents/[id]
// Update a specific incident
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const API_URL = `https://sys.adminpy.com:18001/api/incidents/${id}/`;
    
    console.log(`Updating incident with ID: ${id}`);
    
    // Get authorization header from the incoming request
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
    
    // Add authorization header if present
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }
    
    const response = await fetch(API_URL, {
      method: "PUT",
      headers,
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error(`Error updating incident ${id}:`, response.status, response.statusText);
      return NextResponse.json(
        { error: `Error updating incident with ID ${id}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log(`Successfully updated incident ${id}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in incident ${params.id} API route:`, error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// DELETE /api/incidents/[id]
// Delete a specific incident
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const API_URL = `https://sys.adminpy.com:18001/api/incidents/${id}/`;
    
    console.log(`Deleting incident with ID: ${id}`);
    
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
    
    const response = await fetch(API_URL, {
      method: "DELETE",
      headers,
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
    });
    
    if (!response.ok) {
      console.error(`Error deleting incident ${id}:`, response.status, response.statusText);
      return NextResponse.json(
        { error: `Error deleting incident with ID ${id}` }, 
        { status: response.status }
      );
    }
    
    console.log(`Successfully deleted incident ${id}`);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error in incident ${params.id} API route:`, error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
