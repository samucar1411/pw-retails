import { NextResponse } from "next/server";
import https from "https";

const API_URL = "https://sys.adminpy.com:18001/api/suspectstatus/";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    let apiUrlWithParams = API_URL;
    if (searchParams.toString()) {
      apiUrlWithParams += `?${searchParams.toString()}`;
    }
    
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
    
    const response = await fetch(apiUrlWithParams, {
      method: "GET",
      headers,
      // @ts-expect-error - Required to ignore SSL in Next.js
      agent: agent,
      next: { revalidate: 3600 }, // Cache for 1 hour since statuses don't change often
    });
    
    if (!response.ok) {
      console.error("Error from API:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Error fetching status data" }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Error in suspect status route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Other HTTP methods are not implemented as statuses are typically managed in the backend
export async function POST() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}