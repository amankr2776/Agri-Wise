
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

/**
 * KisanMitra Professional Gate Middleware
 * 
 * Intercepts requests to /pro/* and validates the professional_session cookie.
 * Farmer routes (/dashboard, /diagnostics, /mandi) are ignored by the matcher.
 */
export function middleware(request: NextRequest) {
  const proSession = request.cookies.get('professional_session');
  const { pathname } = request.nextUrl;

  // Protect all /pro routes except the login page itself
  if (pathname.startsWith('/pro') && !pathname.startsWith('/pro/login')) {
    if (!proSession) {
      // No professional session found, redirect to pro-login
      const loginUrl = new URL('/pro/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Define exactly which routes trigger this middleware
  matcher: ['/pro/:path*'],
};
