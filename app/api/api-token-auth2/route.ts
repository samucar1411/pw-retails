import { NextResponse } from "next/server";
import https from "https";
import qs from "qs";

const API_URL = "https://sys.adminpy.com:18001/api-token-auth2/";

export async function POST(request: Request) {
  try {
    console.log("Proxying authentication request to:", API_URL);
    
    // Obtener el cuerpo de la solicitud
    const body = await request.json();
    console.log("Auth request body type:", typeof body);
    
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    
    // Para autenticación necesitamos form-urlencoded
    const headers: Record<string, string> = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    };
    
    // Convertir a form-urlencoded
    const formData = qs.stringify(body);
    
    console.log("Sending auth request with form data:", formData);
    
    const response = await fetch(API_URL, {
      method: "POST",
      headers,
      // @ts-expect-error - Necesario para ignorar SSL en Next.js
      agent: agent,
      body: formData
    });
    
    console.log("Auth response status:", response.status);
    
    if (!response.ok) {
      console.error("Error from Auth API:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Authentication failed" }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("Auth successful, token length:", data.token ? data.token.length : "no token");
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in authentication API route:", error);
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
} 