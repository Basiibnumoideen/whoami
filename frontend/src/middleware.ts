import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenValid(token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const clean = token.trim();
  if (clean === '' || clean === 'null' || clean === 'undefined') return false;

  const parts = clean.split('.');
  if (parts.length !== 3) return false;

  try {
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(payloadBase64);
    const payload = JSON.parse(jsonStr);
    if (!payload || typeof payload !== 'object') return false;
    // Check expiration timestamp
    if (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000) {
      return false;
    }
    // Check required role
    if (payload.role !== 'admin') {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawToken = request.cookies.get('admin_token')?.value;
  const valid = isTokenValid(rawToken);

  // 1. If requesting login page:
  if (pathname === '/admin/login') {
    if (valid) {
      // Already authenticated: redirect directly to dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    // Unauthenticated: allow viewing login page
    return NextResponse.next();
  }

  // 2. For ALL protected admin routes (/admin, /admin/dashboard, /admin/projects, etc.):
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!valid) {
      // Security enforcement: block unauthenticated visitors immediately
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('from', pathname);
      }
      const response = NextResponse.redirect(loginUrl);
      // Clean invalid or expired cookie
      if (rawToken) {
        response.cookies.delete('admin_token');
      }
      return response;
    }

    // Authenticated user hitting root /admin -> redirect to /admin/dashboard
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Valid authenticated token on /admin/* -> proceed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
