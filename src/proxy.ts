import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /services, /packages and /contact belong to the System website: on the main
  // domain (masheedwaqf.com, www) send them to system.masheedwaqf.com
  const host = request.headers.get('host') || '';
  const path = request.nextUrl.pathname;
  const isSystemSitePage = path === '/packages' || path === '/contact' || path === '/services' || path.startsWith('/services/');
  if (isSystemSitePage && host.endsWith('masheedwaqf.com') && !host.startsWith('system.')) {
    const url = new URL(path + request.nextUrl.search, process.env.NEXT_PUBLIC_SYSTEM_URL || 'https://system.masheedwaqf.com');
    return NextResponse.redirect(url, 308);
  }

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isLoginRoute = request.nextUrl.pathname === '/login';
  const isRegisterRoute = request.nextUrl.pathname === '/register';

  // Redirect unauthenticated users away from dashboard
  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if ((isLoginRoute || isRegisterRoute) && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
