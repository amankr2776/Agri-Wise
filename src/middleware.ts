import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

/**
 * KisanMitra Professional Gate Middleware
 * 
 * Protects professional sectors (/pro) by verifying the session cookie.
 */
export function middleware(request: NextRequest) {
  const session = request.cookies.get('professional_session');
  const { pathname } = request.nextUrl;

  // Protect professional routes
  if (pathname.startsWith('/pro/') && !pathname.includes('/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/pro/login', request.url));
    }
    
    try {
      const sessionData = JSON.parse(session.value);
      // Ensure role matches route
      if (pathname.includes('/expert-panel') && sessionData.role !== 'expert') {
        return NextResponse.redirect(new URL('/pro/login', request.url));
      }
      if (pathname.includes('/logistics-bridge') && sessionData.role !== 'logistics') {
        return NextResponse.redirect(new URL('/pro/login', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/pro/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/pro/:path*'],
};