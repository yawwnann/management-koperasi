/**
 * Next.js Middleware for Route Protection
 * Checks authentication and redirects unauthenticated users
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/auth/login', '/auth/forgot-password', '/auth/reset-password'];

// Paths that should redirect to login if not authenticated
const PROTECTED_PATHS = ['/', '/admin', '/saldo', '/laporan', '/pengaturan', '/members'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  
  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  
  // Get auth token from cookie or header
  const authToken = request.cookies.get('auth_token')?.value || 
                    request.headers.get('x-auth-token');
  
  // If it's a public path, allow access
  if (isPublicPath) {
    // If user is already authenticated and trying to access login, redirect to home
    if (pathname === '/auth/login' && authToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }
  
  // If it's not a protected path (e.g., static files, api routes), allow access
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  // If it's a protected path and no auth token, redirect to login
  if (!authToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // User is authenticated, allow access
  return NextResponse.next();
}

// Configure which paths should be matched by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
