import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token') || request.headers.get('Authorization');
  const publicPaths = ['/login', '/forgot-password', '/register'];
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  const isRootPath = request.nextUrl.pathname === '/';

  if (!token && !isPublicPath && !isRootPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isRootPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};