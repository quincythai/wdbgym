import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/checkin", "/leaderboard"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth");

  // allow authcallbacks before redirecting to others
  if (isAuthCallback) {
    return supabaseResponse;
  }

  // not logged in
  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // already logged in?
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/checkin", request.url));
  }

  return supabaseResponse;
}

// which routes to run the middleware on (basically everything not static files and CSS)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
