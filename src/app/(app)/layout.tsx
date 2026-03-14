"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1 overflow-y-auto">{children}</main>

      <nav className="h-16 border-t border-white/40 flex">
        <Link
          href="/checkin"
          className={`flex-1 flex flex-col items-center justify-center text-xs gap-1 transition-colors ${
            pathname === "/checkin" ? "text-white" : "text-white/30"
          }`}
        >
          <span className="text-lg">🏋️</span>
          <span>Check In</span>
        </Link>
        <Link
          href="/leaderboard"
          className={`flex-1 flex flex-col items-center justify-center text-xs gap-1 transition-colors ${
            pathname === "/leaderboard" ? "text-white" : "text-white/30"
          }`}
        >
          <span className="text-lg">🏆</span>
          <span>Leaderboard</span>
        </Link>
      </nav>
    </div>
  );
}
