import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

/**
 * KisanMitra Middleware
 * 
 * Simply allows routing. Persistent role selection is handled via Zustand.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'],
};
