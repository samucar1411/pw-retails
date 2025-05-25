import { NextResponse } from "next/server";
import https from "https";

const API_URL = "https://sys.adminpy.com:18001/api/offices/";

export async function GET(request: Request) {
  try {
    // Get the URL from the request to extract query parameters
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Construct the API URL with query parameters
    let apiUrl = API_URL;
    if (searchParams.toString()) {
      apiUrl += `?${searchParams.toString()}`;
    }
    
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
        { error: "Error fetching offices data" }, 
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

export async function POST(request: Request) {
  try {
    const apiUrl = API_URL;
    console.log("Proxying POST request to:", apiUrl);
    
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
    
    const body = await request.json();
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      console.error("Error from API:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Error creating office" }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in offices API route:", error);
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
      'Allow': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}