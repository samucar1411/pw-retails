import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/auth/login'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If accessing a public route, continue
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For API routes (except auth), add token to headers if available
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    if (token) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('Authorization', `Token ${token}`);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // For protected pages, check if user is authenticated
  if (pathname.startsWith('/dashboard') || pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};