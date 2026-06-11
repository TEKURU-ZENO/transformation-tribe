import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, CalendarDays, ListChecks, Users, MessageCircle, LogOut, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/today", icon: ListChecks, label: "Today" },
  { to: "/planner", icon: CalendarDays, label: "Planner" },
  { to: "/squad", icon: Users, label: "Squad" },
  { to: "/chat", icon: MessageCircle, label: "Guild" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuthUser();

  const { data: profile } = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).single();
      return data;
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (profile?.name || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-white/[0.06] bg-surface/40 backdrop-blur p-4">
        <Link to="/dashboard" className="text-sm font-bold tracking-[0.2em] mb-8 px-2">ASCEND</Link>
        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? "bg-emerald/10 text-emerald" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        {profile && (
          <Link
            to="/profile/$userId"
            params={{ userId: profile.id }}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
          >
            <Avatar className="h-8 w-8"><AvatarFallback>{initials}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{profile.name}</p>
              <p className="text-[10px] text-emerald flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                Lvl {profile.level} · {profile.xp} XP
              </p>
            </div>
          </Link>
        )}
        <button onClick={signOut} className="mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.03]">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between bg-background/90 backdrop-blur border-b border-white/[0.06] px-4 h-12">
        <Link to="/dashboard" className="text-xs font-bold tracking-[0.2em]">ASCEND</Link>
        <button onClick={signOut}><LogOut className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-5 bg-background/95 backdrop-blur border-t border-white/[0.06]">
        {NAV.map((n) => {
          const active = pathname === n.to;
          return (
            <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${active ? "text-emerald" : "text-muted-foreground"}`}>
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 min-w-0 pt-12 md:pt-0 pb-16 md:pb-0">{children}</main>
    </div>
  );
}