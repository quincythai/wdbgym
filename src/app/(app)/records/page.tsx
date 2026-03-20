// src/app/(app)/records/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Record = {
  id: string;
  user_id: string;
  lift: string;
  weight_lbs: number;
  pr_month: number | null;
  pr_year: number | null;
};

type User = {
  id: string;
  full_name: string;
  avatar_url: string;
};

type LiftRecord = {
  user: User;
  weight_lbs: number;
  pr_month: number | null;
  pr_year: number | null;
};

const LIFTS = [
  "Squat",
  "Bench Press",
  "Deadlift",
  "Overhead Press",
  //   "Barbell Row",
  "Dip",
  "Pull Up",
  "Hip Thrust",
  "Calf raise",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatName(fullName: string) {
  const parts = fullName.split(" ");
  if (parts.length < 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function formatDate(month: number | null, year: number | null) {
  if (!month && !year) return null;
  if (month && year) return `${MONTHS[month - 1]} ${year}`;
  if (year) return `${year}`;
  return null;
}

export default function RecordsPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<Record[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [expandedLift, setExpandedLift] = useState<string | null>(null);
  const [logLift, setLogLift] = useState<string | null>(null);
  const [weight, setWeight] = useState("");
  const [prMonth, setPrMonth] = useState("");
  const [prYear, setPrYear] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user.id);

      const [{ data: allRecords }, { data: allUsers }] = await Promise.all([
        supabase.from("records").select("*"),
        supabase
          .from("users")
          .select("id, full_name, avatar_url")
          .eq("approved", true),
      ]);

      setRecords(allRecords ?? []);
      setUsers(allUsers ?? []);
      setLoading(false);
    };

    init();
  }, []);

  const getLiftLeaderboard = (lift: string): LiftRecord[] => {
    // group by user, take max weight per user
    const userMaxes = new Map<string, LiftRecord>();

    records
      .filter((r) => r.lift === lift)
      .forEach((r) => {
        const existing = userMaxes.get(r.user_id);
        if (!existing || r.weight_lbs > existing.weight_lbs) {
          const user = users.find((u) => u.id === r.user_id);
          if (user) {
            userMaxes.set(r.user_id, {
              user,
              weight_lbs: r.weight_lbs,
              pr_month: r.pr_month,
              pr_year: r.pr_year,
            });
          }
        }
      });

    return Array.from(userMaxes.values()).sort(
      (a, b) => b.weight_lbs - a.weight_lbs,
    );
  };

  const handleLogPR = async (lift: string) => {
    if (!weight || isNaN(parseInt(weight))) return;
    setSubmitting(true);

    const supabase = createClient();
    await supabase.from("records").upsert(
      {
        user_id: currentUser,
        lift,
        weight_lbs: parseInt(weight),
        pr_month: prMonth ? parseInt(prMonth) : null,
        pr_year: prYear ? parseInt(prYear) : null,
      },
      { onConflict: "user_id, lift" },
    );

    // refresh records
    const { data } = await supabase.from("records").select("*");
    setRecords(data ?? []);
    setWeight("");
    setPrMonth("");
    setPrYear("");
    setLogLift(null);
    setSubmitting(false);
  };

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
    <div className="flex flex-col bg-black text-white px-4 pt-8 pb-4 gap-2">
      <p className="font-bold text-center text-white text-lg tracking-widest uppercase mb-4">
        Club Records
      </p>

      {LIFTS.map((lift) => {
        const leaderboard = getLiftLeaderboard(lift);
        const isExpanded = expandedLift === lift;
        const myPR = leaderboard.find((r) => r.user.id === currentUser);
        const topPR = leaderboard[0];

        return (
          <div
            key={lift}
            className="rounded-lg bg-white/5 border border-white/10 overflow-hidden"
          >
            {/* lift row header */}
            <button
              className="w-full flex items-center justify-between px-4 py-4"
              onClick={() => setExpandedLift(isExpanded ? null : lift)}
            >
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-white">{lift}</span>
                {topPR && (
                  <span className="text-xs text-white/40 mt-0.5">
                    Top: {topPR.weight_lbs}lbs —{" "}
                    {formatName(topPR.user.full_name)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {myPR && (
                  <span className="text-xs text-white/50">
                    You: {myPR.weight_lbs}lbs
                  </span>
                )}
                <span className="text-white/30 text-sm">
                  {isExpanded ? "▲" : "▾"}
                </span>
              </div>
            </button>

            {/* expanded leaderboard */}
            {isExpanded && (
              <div className="border-t border-white/10">
                {leaderboard.length === 0 ? (
                  <p className="text-white/30 text-xs text-center py-4">
                    No PRs logged yet
                  </p>
                ) : (
                  <div className="flex flex-col">
                    {leaderboard.map((entry, i) => (
                      <div
                        key={entry.user.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          entry.user.id === currentUser ? "bg-white/5" : ""
                        } ${i !== leaderboard.length - 1 ? "border-b border-white/5" : ""}`}
                      >
                        <span className="text-white/30 text-xs w-4">
                          {i + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center shrink-0">
                          {entry.user.avatar_url ? (
                            <img
                              src={entry.user.avatar_url}
                              alt={entry.user.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-white/50">
                              {entry.user.full_name[0]}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="text-sm text-white/80">
                            {formatName(entry.user.full_name)}
                            {entry.user.id === currentUser && (
                              <span className="text-white/30 text-xs ml-1">
                                (you)
                              </span>
                            )}
                          </span>
                          {formatDate(entry.pr_month, entry.pr_year) && (
                            <span className="text-xs text-white/30">
                              {formatDate(entry.pr_month, entry.pr_year)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {entry.weight_lbs}lbs
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* log PR form */}
                {logLift === lift ? (
                  <div className="px-4 py-4 border-t border-white/10 flex flex-col gap-3">
                    <input
                      type="number"
                      placeholder="Weight (lbs)"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder:text-white/30 w-full"
                    />
                    <div className="flex gap-2">
                      <select
                        value={prMonth}
                        onChange={(e) => setPrMonth(e.target.value)}
                        className="bg-white/10 text-white/60 text-sm rounded-lg px-3 py-2 outline-none flex-1"
                      >
                        <option value="">Month (optional)</option>
                        {MONTHS.map((m, i) => (
                          <option key={m} value={i + 1}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Year (optional)"
                        value={prYear}
                        onChange={(e) => setPrYear(e.target.value)}
                        className="bg-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder:text-white/30 flex-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLogPR(lift)}
                        disabled={submitting || !weight}
                        className="flex-1 bg-white text-black text-sm font-medium py-2 rounded-lg disabled:opacity-50"
                      >
                        {submitting ? "Saving..." : "Save PR"}
                      </button>
                      <button
                        onClick={() => setLogLift(null)}
                        className="flex-1 bg-white/10 text-white/60 text-sm py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setLogLift(lift)}
                    className="w-full py-3 text-xs text-white/40 tracking-widest uppercase border-t border-white/10 hover:text-white/60 transition-colors"
                  >
                    + Log PR
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
