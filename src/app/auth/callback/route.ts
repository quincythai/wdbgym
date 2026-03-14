import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    // list of cookies from the current request
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          },
        },
      },
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // upsert = insert if new, do nothing if exists
        await supabase.from("users").upsert(
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
          },
          { onConflict: "id" },
        );
      }

      return NextResponse.redirect(`${origin}/checkin`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
