import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token and check admin role
      const user = await verifyToken(token);
      const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];

      if (!user || !adminRoles.includes(user?.role || '')) {
        // Redirect to dashboard if not admin
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect dashboard routes (requires authentication)
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token
      const user = await verifyToken(token);

      if (!user) {
        // Redirect to login if invalid token
        const loginUrl = new URL('/auth', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // Invalid token, redirect to login
      const loginUrl = new URL('/auth', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect API routes that require authentication
  if (pathname.startsWith('/api/v1')) {
    // Public routes that don't require authentication
    const publicRoutes = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/products',
      '/api/v1/categories',
      '/api/v1/content/landing',
      '/api/v1/payments/callback'
    ];

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (!isPublicRoute) {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      try {
        const user = await verifyToken(token);

        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Invalid authentication' },
            { status: 401 }
          );
        }

        // Check admin-only API routes
        const adminRoutes = [
          '/api/v1/admin',
          '/api/v1/users',
          '/api/v1/products/create',
          '/api/v1/products/update',
          '/api/v1/products/delete'
        ];

        const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

        if (isAdminRoute) {
          const adminRoles = ['SUPER_ADMIN', 'ORDER_MANAGER', 'FINANCE_MANAGER', 'CONTENT_MANAGER'];

          if (!adminRoles.includes(user?.role || '')) {
            return NextResponse.json(
              { success: false, error: 'Admin access required' },
              { status: 403 }
            );
          }
        }
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Invalid authentication' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/v1/:path*',
    '/dashboard/:path*'
  ]
};