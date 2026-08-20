import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const mockEmail = request.cookies.get('masheed-user-email')?.value;
  const mockUserId = request.cookies.get('masheed-user-id')?.value;
  const mockRole = request.cookies.get('masheed-mock-role')?.value;

  let hasSupabaseUser = false;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wyxyrehrpsohkaoanldm.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key',
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    hasSupabaseUser = !!user;
  } catch (e) {}

  const isAuthenticated = hasSupabaseUser || !!mockEmail || !!mockUserId || !!mockRole;

  const host = request.headers.get('host') || '';
  const isSystemSubdomain = host.startsWith('system.') || host.includes('system.masheedwaqf.com');

  const pathname = request.nextUrl.pathname;
  const isRootRoute = pathname === '/';
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';
  const isRegisterRoute = pathname === '/register';

  // Subdomain Routing for system.masheedwaqf.com:
  // Direct root path `/` on system subdomain to `/login` (if guest) or `/dashboard` (if authenticated)
  if (isSystemSubdomain && isRootRoute) {
    const url = request.nextUrl.clone();
    url.pathname = isAuthenticated ? (mockRole === 'admin' ? '/admin' : '/dashboard') : '/login';
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from protected routes
  if ((isDashboardRoute || isAdminRoute) && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login/register pages
  if ((isLoginRoute || isRegisterRoute) && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = mockRole === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
