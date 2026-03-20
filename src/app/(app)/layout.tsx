import { redirect } from "next/navigation";
import TabBar from "@/components/TabBar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("approved")
    .eq("id", user.id)
    .single();

  if (!profile?.approved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-6 text-center">
        <p className="text-2xl mb-2">⏳</p>
        <p className="text-white/80 font-medium">Pending Approval</p>
        <p className="text-white/40 text-sm mt-2">
          Your account is pending admin approval.
        </p>
        <p className="text-white/40 text-sm mt-2">
          Try logging in with your Berkeley email, if you are in WDB.
        </p>
        <p className="text-white/40 text-sm mt-2">
          3/17: For non-WDB members, I'm working to add a spectator mode so you
          can see the leaderboard
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col bg-black text-white overflow-hidden"
      style={{ height: "100dvh" }}
    >
      <main className="flex-1 overflow-y-auto">{children}</main>
      <TabBar />
    </div>
  );
}
