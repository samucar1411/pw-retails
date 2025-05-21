import { NextResponse } from "next/server";
import https from "https";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const API_URL = `https://sys.adminpy.com:18001/api/companys/${id}/`;
    
    console.log(`Proxying request to specific companys: ${API_URL}`);
    
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
      method: "GET",
      headers,
      // @ts-expect-error - Necesario para ignorar SSL en Next.js
      agent: agent,
      next: { revalidate: 60 }, // Revalidar cada 60 segundos
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
    console.error("Error in companys API route:", error);
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
    const API_URL = `https://sys.adminpy.com:18001/api/companys/${id}/`;
    
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
    console.error("Error in companys API route:", error);
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
  try {
    const id = params.id;
    const API_URL = `https://sys.adminpy.com:18001/api/companys/${id}/`;
    
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
      return NextResponse.json(
        { error: "Error deleting data" }, 
        { status: response.status }
      );
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error in companys API route:", error);
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