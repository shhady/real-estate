import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/properties',
    '/properties/(.*)',
    '/agents',
    '/agents/(.*)',
    '/seller',
    '/seller/(.*)',
    '/buyer',
    '/buyer/(.*)',
    '/renter',
    '/renter/(.*)',
    '/landlord',
    '/landlord/(.*)',
    '/blog',
    '/blog/(.*)',
    '/contact',
    '/api/properties',
    '/api/agents',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/verify-reset-token',
    '/api/auth/reset-password',
    '/api/users/process-logo',
    '/api/test-logo',
    '/api/deal-scores',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password'
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('(.*)')) {
      const baseRoute = route.replace('(.*)', '');
      return request.nextUrl.pathname.startsWith(baseRoute);
    }
    return request.nextUrl.pathname === route;
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  try {
    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};