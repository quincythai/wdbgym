"use client";

import Image from "next/image";
import { Great_Vibes } from "next/font/google";
import CarouselBackground from "@/components/CarouselBackground";
import { createClient } from "@/lib/supabase/client";

const cursive = Great_Vibes({ subsets: ["latin"], weight: "400" });

export default function Login() {
  const handleSignIn = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <main
      className="relative bg-black flex flex-col items-center overflow-hidden justify-center"
      style={{ minHeight: "100dvh" }}
    >
      <CarouselBackground />

      {/* Dark vignette overlay */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-black/40 via-black/10 to-transparent pointer-events-none" />

      {/* Logo + cursive text overlaid */}
      <div className="relative">
        <div className="relative flex items-center justify-center w-full max-w-xs">
          <Image
            src="/fat-wdb.svg"
            alt="WDB Gym"
            width={220}
            height={220}
            className="invert"
          />
          <span
            className={`${cursive.className} absolute -right-2 top-5/6 -translate-y-1/3 text-4xl text-white/80 pointer-events-none`}
          >
            gym
          </span>
        </div>
        <p className="mt-8 text-white/70 text-sm tracking-[0.25em] uppercase">
          is you a hustler? or nah...
        </p>
        {/* login button */}

        <button
          className="mt-6 w-full flex items-center justify-center gap-3 bg-white font-bold py-3 px-6 rounded-full text-md hover:bg-white/90 active:scale-95 transition-all"
          onClick={handleSignIn}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <p className="text-sm font-light text-black uppercase">Login</p>
        </button>
      </div>
    </main>
  );
}
