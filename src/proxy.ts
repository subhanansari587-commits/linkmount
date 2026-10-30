import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'linkmount_jwt_secret_must_be_configured_in_env';
const secretKey = new TextEncoder().encode(JWT_SECRET);

async function isSessionValid(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return Boolean(payload?.id && payload?.email);
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Pass through static files and internal Next.js assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico'

  ) {
    return NextResponse.next();
  }

  // 2. Root "/" -> server-side redirect to "/link-expired" (real redirect with replace semantics)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/link-expired', request.url));
  }

  // 3. Error pages
  if (pathname === '/link-expired' || pathname === '/unauthorized') {
    return NextResponse.next();
  }

  // 4. Public APIs
  if (
    pathname.startsWith('/api/public/') ||
    pathname.startsWith('/api/uploads/')
  ) {
    return NextResponse.next();
  }

  // 5. Admin login API
  if (pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  // 6. Admin login page
  if (pathname === '/admin/login') {
    const loggedIn = await isSessionValid(request);
    if (loggedIn) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // 7. Protected Admin APIs
  if (pathname.startsWith('/api/admin/')) {
    const loggedIn = await isSessionValid(request);
    if (!loggedIn) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // 8. Protected Admin Pages
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const loggedIn = await isSessionValid(request);
    if (!loggedIn) {
      const nextParam = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/admin/login?next=${nextParam}`, request.url));
    }
    return NextResponse.next();
  }

  // 9. Public tenant page: only /p/<token> with non-empty token is allowed
  if (pathname.startsWith('/p/')) {
    const token = pathname.slice('/p/'.length).trim();
    if (token && !token.includes('/')) {
      return NextResponse.next();
    }
  }

  // 10. ANY other URL (e.g. /abc, /p, /login, /admin-x, other guessed paths) -> rewrite to /unauthorized (401)
  return NextResponse.rewrite(new URL('/unauthorized', request.url), {
    status: 401,
  });
}

// Export middleware as alias for full compatibility
export const middleware = proxy;

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
