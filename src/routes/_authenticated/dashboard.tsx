import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";
import { todayISO, completeTask, uncompleteTask, xpForLevel } from "@/lib/ascend";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Flame, Plus, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user } = useAuthUser();
  const [newTask, setNewTask] = useState("");

  const profileQ = useQuery({
    queryKey: ["me", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).single()).data,
  });

  const today = todayISO();
  const tasksQ = useQuery({
    queryKey: ["tasks", user?.id, today],
    enabled: !!user,
    queryFn: async () => (await supabase.from("tasks").select("*").eq("user_id", user!.id).eq("date", today).order("created_at")).data ?? [],
  });

  const weekQ = useQuery({
    queryKey: ["week-tasks", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      const startISO = start.toISOString().slice(0, 10);
      return (await supabase.from("tasks").select("completed").eq("user_id", user!.id).gte("date", startISO)).data ?? [];
    },
  });

  const squadQ = useQuery({
    queryKey: ["my-squads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("squad_members").select("squad_id").eq("user_id", user!.id);
      return data?.map((d) => d.squad_id) ?? [];
    },
  });

  const friendsQ = useQuery({
    queryKey: ["friends", squadQ.data],
    enabled: !!squadQ.data && squadQ.data.length > 0,
    queryFn: async () => {
      const { data: members } = await supabase
        .from("squad_members")
        .select("user_id")
        .in("squad_id", squadQ.data!);
      const ids = Array.from(new Set((members ?? []).map((m) => m.user_id))).filter((id) => id !== user!.id);
      if (!ids.length) return [];
      const { data: profs } = await supabase.from("profiles").select("*").in("id", ids);
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      const startISO = start.toISOString().slice(0, 10);
      const { data: ftasks } = await supabase
        .from("tasks")
        .select("user_id,completed")
        .in("user_id", ids)
        .gte("date", startISO);
      return (profs ?? []).map((p) => {
        const t = (ftasks ?? []).filter((x) => x.user_id === p.id);
        const pct = t.length ? Math.round((t.filter((x) => x.completed).length / t.length) * 100) : 0;
        return { ...p, weekPct: pct };
      });
    },
  });

  const activityQ = useQuery({
    queryKey: ["activity-feed"],
    queryFn: async () => {
      const { data } = await supabase
        .from("activities")
        .select("*, profiles(name)")
        .order("created_at", { ascending: false })
        .limit(15);
      return data ?? [];
    },
    refetchInterval: 10_000,
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("dash-activity")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities" }, () => activityQ.refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, activityQ]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    await supabase.from("tasks").insert({ user_id: user.id, title: newTask.trim(), date: today, xp: 10 });
    setNewTask("");
    tasksQ.refetch();
  }

  async function toggle(t: any) {
    if (t.completed) await uncompleteTask(t.id, t.xp);
    else await completeTask(t.id, t.xp, t.title);
    tasksQ.refetch();
    profileQ.refetch();
    weekQ.refetch();
    activityQ.refetch();
  }

  const profile = profileQ.data;
  const xpNext = profile ? xpForLevel(profile.level) : 100;
  const xpThis = profile ? xpForLevel(profile.level - 1) : 0;
  const xpPct = profile ? Math.round(((profile.xp - xpThis) / (xpNext - xpThis)) * 100) : 0;

  const weekDone = (weekQ.data ?? []).filter((t) => t.completed).length;
  const weekTotal = (weekQ.data ?? []).length;
  const weekPct = weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-10">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold">{greeting()}, {profile?.name || "friend"}</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald" /> Level {profile?.level ?? 1} · {profile?.xp ?? 0} XP
          </p>
        </div>
        {profile?.current_streak ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold text-sm">
            <Flame className="h-4 w-4" /> {profile.current_streak} day streak
          </div>
        ) : null}
      </div>

      <div className="mb-8 glass-card rounded-2xl p-5">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-muted-foreground uppercase tracking-widest">Weekly Progress</span>
          <span className="text-foreground font-mono">{weekDone}/{weekTotal} · {weekPct}%</span>
        </div>
        <Progress value={weekPct} className="h-2" />
        <div className="flex justify-between text-[10px] mt-3 text-muted-foreground">
          <span>XP to Lvl {(profile?.level ?? 1) + 1}</span>
          <span>{Math.max(0, xpNext - (profile?.xp ?? 0))} XP</span>
        </div>
        <Progress value={xpPct} className="h-1 mt-1" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's tasks */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Today's Tasks</h2>
          <form onSubmit={addTask} className="flex gap-2 mb-4">
            <Input value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a task for today…" />
            <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
          </form>
          <ul className="space-y-2">
            {(tasksQ.data ?? []).map((t) => (
              <li key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-emerald/20 transition">
                <Checkbox checked={t.completed} onCheckedChange={() => toggle(t)} />
                <span className={`flex-1 text-sm ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</span>
                <span className="text-[10px] font-mono text-emerald">+{t.xp} XP</span>
              </li>
            ))}
            {tasksQ.data?.length === 0 && (
              <li className="text-sm text-muted-foreground text-center py-6">No tasks yet. Add one above.</li>
            )}
          </ul>
        </div>

        {/* Friends sidebar */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Friends</h2>
            {squadQ.data?.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">No squad yet.</p>
                <Link to="/squad" className="text-xs text-emerald font-semibold">Create or join one →</Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {(friendsQ.data ?? []).map((f) => (
                  <li key={f.id}>
                    <Link to="/profile/$userId" params={{ userId: f.id }} className="flex items-center gap-3 group">
                      <Avatar className="h-8 w-8"><AvatarFallback>{f.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate group-hover:text-emerald">{f.name}</p>
                        <Progress value={f.weekPct} className="h-1 mt-1" />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{f.weekPct}%</span>
                    </Link>
                  </li>
                ))}
                {friendsQ.data?.length === 0 && (
                  <li className="text-xs text-muted-foreground text-center py-2">Invite friends to your squad.</li>
                )}
              </ul>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Activity Feed</h2>
            <ul className="space-y-3 max-h-80 overflow-auto">
              {(activityQ.data ?? []).map((a: any) => (
                <li key={a.id} className="text-xs flex items-start gap-2">
                  <span>{a.emoji}</span>
                  <span className="flex-1">
                    <span className="font-semibold text-foreground">{a.profiles?.name ?? "Someone"}</span>{" "}
                    <span className="text-muted-foreground">{a.message}</span>
                  </span>
                </li>
              ))}
              {activityQ.data?.length === 0 && (
                <li className="text-xs text-muted-foreground text-center py-2">Quiet so far. Complete a task!</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}