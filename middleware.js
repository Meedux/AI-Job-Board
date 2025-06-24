import { NextResponse } from 'next/server';
import { verifyToken } from './utils/auth';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/about',
  '/terms',
  '/api/jobs',
  '/api/jobs/*',
  '/api/auth/*',  // Allow all auth API routes
  '/api/users',   // Allow users API for admin
  '/_next/*',     // Allow Next.js assets
  '/favicon.ico', // Allow favicon
];

// Check if route is public
const isPublicRoute = (pathname) => {
  return publicRoutes.some(route => {
    if (route.endsWith('/*')) {
      // Remove /* and check if pathname starts with the base path
      const basePath = route.slice(0, -2);
      return pathname.startsWith(basePath);
    }
    if (route.endsWith('*')) {
      // Remove * and check if pathname starts with the base path
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route;
  });
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log('🛡️ Middleware checking:', pathname);
  console.log('🔍 Route check details:', {
    pathname,
    isPublic: isPublicRoute(pathname),
    matchedRoutes: publicRoutes.filter(route => {
      if (route.endsWith('/*')) {
        const basePath = route.slice(0, -2);
        return pathname.startsWith(basePath);
      }
      if (route.endsWith('*')) {
        return pathname.startsWith(route.slice(0, -1));
      }
      return pathname === route;
    })
  });
  
  // Allow public routes
  if (isPublicRoute(pathname)) {
    console.log('✅ Public route allowed:', pathname);
    return NextResponse.next();
  }
  
  console.log('🔒 Protected route, checking auth:', pathname);
  
  // Check for authentication token
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    console.log('❌ No token found, redirecting to login');
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify token
  const user = verifyToken(token);
  if (!user) {
    console.log('❌ Invalid token, redirecting to login');
    // Redirect to login if invalid token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  console.log('✅ User authenticated:', user.email);
  
  // Add user info to request headers for use in pages
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-uid', user.uid);
  requestHeaders.set('x-user-email', user.email);
  requestHeaders.set('x-user-name', user.fullName);
  
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
