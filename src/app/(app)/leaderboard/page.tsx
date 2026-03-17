// src/app/(app)/leaderboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserCount = {
  id: string;
  full_name: string;
  avatar_url: string;
  count: number;
  checkedDays: boolean[];
};

const DAYS = ["M", "T", "W", "Th", "F", "Sa", "Su"];

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
  const label = `Week ${fmt(weekStart)} (Mon) – ${fmt(weekEnd)} (Sun)`;

  return { weekStart, label };
}

function formatName(fullName: string) {
  const parts = fullName.split(" ");
  if (parts.length < 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function getCheckedDays(userCheckins: { checked_in_at: string }[]) {
  if (!userCheckins || userCheckins.length === 0) {
    return DAYS.map(() => false);
  }
  const dayIndices = userCheckins.map((c) => {
    const d = new Date(c.checked_in_at).getDay();
    return d === 0 ? 6 : d - 1;
  });
  return DAYS.map((_, i) => dayIndices.includes(i));
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [allRanked, setAllRanked] = useState<UserCount[]>([]);
  const [tiers, setTiers] = useState<UserCount[][]>([]);
  const [weekLabel, setWeekLabel] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { weekStart, label } = getWeekBounds();
      setWeekLabel(label);

      const [{ data: users }, { data: checkins }] = await Promise.all([
        supabase
          .from("users")
          .select("id, full_name, avatar_url")
          .eq("approved", true),
        supabase
          .from("checkins")
          .select("user_id, checked_in_at")
          .gte("checked_in_at", weekStart.toISOString()),
      ]);

      if (!users) return;

      const counts: UserCount[] = users
        .map((user) => {
          const userCheckins =
            checkins?.filter((c) => c.user_id === user.id) ?? [];
          return {
            ...user,
            count: userCheckins.length,
            checkedDays: getCheckedDays(userCheckins),
          };
        })
        .sort((a, b) => b.count - a.count);

      const uniqueCounts = [...new Set(counts.map((u) => u.count))]
        .filter((c) => c > 0)
        .sort((a, b) => b - a)
        .slice(0, 3);

      const computedTiers = uniqueCounts.map((count) =>
        counts.filter((u) => u.count === count),
      );

      setAllRanked(counts);
      setTiers(computedTiers);
      setLoading(false);
    };

    init();
  }, []);

  const getTier = (user: UserCount) =>
    tiers.findIndex((t) => t.some((u) => u.id === user.id));

  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-black"
        style={{ minHeight: "calc(100vh - 4rem)" }}
      >
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-black text-white px-4 pt-8 pb-4">
      <p className="font-bold text-center text-white text-lg tracking-widest uppercase mb-8">
        {weekLabel}
      </p>

      <div className="flex flex-col gap-2">
        {allRanked.map((user) => {
          const tier = getTier(user);
          const isGold = tier === 0 && user.count > 0;
          const isSilver = tier === 1;
          const isBronze = tier === 2;

          return (
            <div
              key={user.id}
              className={`flex flex-col gap-2 px-3 py-3 rounded-lg ${
                isGold
                  ? "bg-yellow-500/20 border border-yellow-500/30"
                  : isSilver
                    ? "bg-white/10 border border-white/10"
                    : isBronze
                      ? "bg-white/5 border border-white/5"
                      : "bg-white/5"
              }`}
            >
              {/* top row: medal, avatar, name */}
              <div className="flex items-center gap-2 rounded-lg">
                <span className="text-lg w-6 text-center shrink-0">
                  {isGold ? "🥇" : isSilver ? "🥈" : isBronze ? "🥉" : ""}
                </span>
                <div className="w-9 h-9 rounded-full bg-white/20 overflow-hidden flex items-center justify-center shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-white/50">
                      {user.full_name[0]}
                    </span>
                  )}
                </div>
                <span className="text-sm text-white/80 shrink-0">
                  {formatName(user.full_name)}
                </span>
                <span
                  className={`text-xs font-medium shrink-0 ${isGold ? "text-yellow-400" : "text-white/40"}`}
                >
                  {user.count}x
                </span>

                {/* day circles inline */}
                {user.count > 0 ? (
                  <div className="flex gap-1 flex-1 justify-end">
                    {DAYS.map((day, i) => (
                      <div
                        key={day}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0 ${
                          user.checkedDays[i]
                            ? isGold
                              ? "bg-yellow-400 text-black"
                              : "bg-white text-black"
                            : "bg-white/10 text-white/30"
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-white/20 flex-1 text-right">
                    no visits
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
