import { NextResponse } from 'next/server';

// Only protect server-side API routes that need authentication
const protectedApiRoutes = [
  '/api/users',  // Admin only
];

// Public routes that should never be protected by middleware
const publicRoutes = [
  '/',
  '/about',
  '/terms',
  '/login',
  '/register',
  '/pricing',
  '/feedback',
  '/job',
  '/api/jobs',
  '/api/auth', // All auth endpoints
];

// Check if route is public
const isPublicRoute = (pathname) => {
  return publicRoutes.some(route => {
    if (route === '/api/auth') {
      return pathname.startsWith('/api/auth');
    }
    if (route === '/job') {
      return pathname.startsWith('/job/');
    }
    if (route === '/api/jobs') {
      return pathname.startsWith('/api/jobs');
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
};

// Check if route is a protected API route
const isProtectedApiRoute = (pathname) => {
  return protectedApiRoutes.some(route => pathname.startsWith(route));
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log('🛡️ Middleware checking:', pathname);
  
  // Always allow public routes
  if (isPublicRoute(pathname)) {
    console.log('✅ Public route allowed:', pathname);
    return NextResponse.next();
  }
  
  // Only check auth for protected API routes
  if (isProtectedApiRoute(pathname)) {
    console.log('🔒 Protected API route, checking auth:', pathname);
    
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      console.log('❌ No token for protected API route');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For now, just check if token exists
    // You can add proper JWT verification here if needed
    console.log('✅ Token found for protected API route');
  }
  
  // For all other routes (client-side pages), let them through
  // Client-side authentication will be handled by ProtectedRoute component
  console.log('📄 Client-side route, allowing through:', pathname);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
