// src/app/(app)/checkin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const GYM_LAT = 37.8678;
const GYM_LNG = -122.262;
const GYM_RADIUS_METERS = 150;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function CheckinPage() {
  const [loading, setLoading] = useState(true);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkinTime, setCheckinTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from("checkins")
        .select("checked_in_at")
        .eq("user_id", user.id)
        .gte("checked_in_at", today.toISOString())
        .limit(1)
        .single();

      if (data) {
        setCheckedIn(true);
        setCheckinTime(
          new Date(data.checked_in_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleCheckin = async () => {
    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistance(latitude, longitude, GYM_LAT, GYM_LNG);

        if (distance > GYM_RADIUS_METERS) {
          alert(
            `You must be at the RSF to check in. You are ${Math.round(distance)}m away.`,
          );
          setSubmitting(false);
          return;
        }

        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("checkins")
          .insert({ user_id: user.id })
          .select("checked_in_at")
          .single();

        if (!error && data) {
          setCheckedIn(true);
          setCheckinTime(
            new Date(data.checked_in_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          );
        }

        setSubmitting(false);
      },
      (error) => {
        alert("Please enable location services to check in.");
        setSubmitting(false);
      },
    );
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
    <div
      className="relative flex flex-col items-center justify-center bg-black text-white px-6"
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      {checkedIn ? (
        <p className="text-white/70 text-sm tracking-widest uppercase">
          You&apos;ve checked in at {checkinTime}
        </p>
      ) : (
        <>
          <p className="text-white/50 text-sm tracking-widest uppercase mb-10">
            You have not checked in yet today.
          </p>
          <button
            onClick={handleCheckin}
            disabled={submitting}
            className="w-48 h-48 rounded-full border border-white/20 text-white font-bold tracking-widest uppercase text-sm hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? "Checking in..." : "Check In"}
          </button>
        </>
      )}

      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleSignOut}
          className="text-black text-xs tracking-widest uppercase hover:text-black/60 transition-colors bg-white rounded-full px-4 py-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
