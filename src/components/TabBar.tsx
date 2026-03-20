"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="h-16 border-t border-white/10 flex">
      <Link
        href="/checkin"
        className={`flex-1 flex flex-col items-center justify-center text-sm gap-1 transition-colors ${pathname === "/checkin" ? "text-white" : "text-white/30"}`}
      >
        <span className="text-xl">🏋️</span>
        <span>Check In</span>
      </Link>
      <Link
        href="/leaderboard"
        className={`flex-1 flex flex-col items-center justify-center text-sm gap-1 transition-colors ${pathname === "/leaderboard" ? "text-white" : "text-white/30"}`}
      >
        <span className="text-lg">🏆</span>
        <span>Leaderboard</span>
      </Link>
      <Link
        href="/records"
        className={`flex-1 flex flex-col items-center justify-center text-xs gap-1 transition-colors ${pathname === "/records" ? "text-white" : "text-white/30"}`}
      >
        <span className="text-lg">💪</span>
        <span>Records</span>
      </Link>
    </nav>
  );
}
