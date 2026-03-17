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
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <TabBar />
    </div>
  );
}
