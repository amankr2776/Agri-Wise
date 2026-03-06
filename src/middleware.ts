import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

/**
 * KisanMitra Professional Gate Middleware - DISABLED
 * 
 * Authentication has been removed. This middleware now permits all traffic.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/pro/:path*'],
};