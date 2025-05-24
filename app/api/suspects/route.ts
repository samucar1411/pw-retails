import { NextResponse } from "next/server";
import https from "https";

const API_URL = "https://sys.adminpy.com:18001/api/suspects/";

// GET /api/suspects
// List all suspects with pagination
export async function GET(request: Request) {
  try {
    // Get the URL from the request to extract query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Construct the API URL with query parameters
    let apiUrlWithParams = API_URL;
    if (searchParams.toString()) {
      apiUrlWithParams += `?${searchParams.toString()}`;
    }
    
    console.log("Proxying request to:", apiUrlWithParams);
    console.log("Query parameters:", Object.fromEntries(searchParams.entries()));
    
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
      console.error("Error from API:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Error fetching data" }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in suspects API route:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// POST /api/suspects
// Create a new suspect
export async function POST(request: Request) {
  try {
    console.log("Proxying POST request to:", API_URL);
    
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
      method: "POST",
      headers,
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error("Error from API:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Error creating data" }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in suspects API route:", error);
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
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
