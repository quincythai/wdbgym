// src/app/(app)/leaderboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserCount = {
  id: string;
  full_name: string;
  avatar_url: string;
  count: number;
};

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

const medals = ["🥇", "🥈", "🥉"];
const podiumHeights = ["h-28", "h-20", "h-16"];
const podiumOrder = [1, 0, 2]; // silver, gold, bronze display order

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [tiers, setTiers] = useState<UserCount[][]>([]);
  const [rest, setRest] = useState<UserCount[]>([]);
  const [weekLabel, setWeekLabel] = useState("");

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { weekStart, label } = getWeekBounds();
      setWeekLabel(label);

      const [
        { data: users, error: usersError },
        { data: checkins, error: checkinsError },
      ] = await Promise.all([
        supabase.from("users").select("id, full_name, avatar_url"),
        //   .eq("approved", true),
        supabase
          .from("checkins")
          .select("user_id")
          .gte("checked_in_at", weekStart.toISOString()),
      ]);

      if (!users) return;

      const counts: UserCount[] = users
        .map((user) => ({
          ...user,
          count: checkins?.filter((c) => c.user_id === user.id).length ?? 0,
        }))
        .sort((a, b) => b.count - a.count);

      const uniqueCounts = [...new Set(counts.map((u) => u.count))]
        .filter((c) => c > 0)
        .sort((a, b) => b - a)
        .slice(0, 3);

      const computedTiers = uniqueCounts.map((count) =>
        counts.filter((u) => u.count === count),
      );
      const computedRest = counts.filter(
        (u) => !uniqueCounts.includes(u.count),
      );

      setTiers(computedTiers);
      setRest(computedRest);
      setLoading(false);
    };

    init();
  }, []);

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
      {/* week label */}
      <p className="font-bold text-center text-white text-lg tracking-widest uppercase mb-8">
        {weekLabel}
      </p>

      {/* podium */}
      {tiers.length > 0 && (
        <div className="flex items-end justify-center gap-3 mb-10">
          {podiumOrder.map((tierIndex) => {
            const tier = tiers[tierIndex];
            if (!tier) return <div key={tierIndex} className="w-24" />;
            return (
              <div
                key={tierIndex}
                className="flex flex-col items-center gap-1 w-24"
              >
                {/* stacked avatars if tied */}
                <div className="flex flex-col items-center gap-1 mb-1">
                  {tier.map((user) => (
                    <div key={user.id} className="flex flex-col items-center">
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                      />
                      <p className="text-white/80 text-xs text-center mt-1 leading-tight">
                        {user.full_name.split(" ")[0]}
                      </p>
                    </div>
                  ))}
                </div>
                {/* podium block */}
                <div
                  className={`w-full ${podiumHeights[tierIndex]} bg-white/10 rounded-t-md flex flex-col items-center justify-start pt-2 gap-1`}
                >
                  <span className="text-lg">{medals[tierIndex]}</span>
                  <span className="text-white/60 text-xs">
                    {tier[0].count}x
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* rest as rows */}
      <div className="flex flex-col gap-2">
        {rest.map((user, i) => (
          <div
            key={user.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5"
          >
            <span className="text-white/30 text-md w-4">
              {tiers.length + 1 + i}
            </span>
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="flex-1 text-md text-white/80">
              {user.full_name}
            </span>
            <span className="text-white/40 text-md">{user.count}x</span>
          </div>
        ))}
      </div>
    </div>
  );
}
