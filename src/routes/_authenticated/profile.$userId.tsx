import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Zap, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile/$userId")({
  component: Profile,
});

function Profile() {
  const { userId } = Route.useParams();

  const q = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      const startISO = start.toISOString().slice(0, 10);
      const { data: weekTasks } = await supabase.from("tasks").select("*").eq("user_id", userId).gte("date", startISO);
      const { data: recent } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("completed", true)
        .order("completed_at", { ascending: false })
        .limit(10);
      const done = (weekTasks ?? []).filter((t) => t.completed).length;
      const total = (weekTasks ?? []).length;
      return {
        profile,
        weekPct: total ? Math.round((done / total) * 100) : 0,
        weekDone: done,
        weekTotal: total,
        recent: recent ?? [],
      };
    },
  });

  if (!q.data?.profile) return <div className="p-10 text-muted-foreground">Loading…</div>;
  const p = q.data.profile;

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10">
      <div className="flex items-center gap-5 mb-8">
        <Avatar className="h-20 w-20 ring-2 ring-emerald/30">
          <AvatarFallback className="text-2xl">{p.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{p.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1 text-emerald"><Trophy className="h-4 w-4" /> Lvl {p.level}</span>
            <span className="flex items-center gap-1"><Zap className="h-4 w-4 text-gold" /> {p.xp} XP</span>
            {p.current_streak > 0 && (
              <span className="flex items-center gap-1 text-gold"><Flame className="h-4 w-4" /> {p.current_streak} day streak</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat label="Weekly Completion" value={`${q.data.weekPct}%`} />
        <Stat label="Tasks This Week" value={`${q.data.weekDone}/${q.data.weekTotal}`} />
        <Stat label="Total Completed" value={String(q.data.recent.length >= 10 ? "10+" : q.data.recent.length)} />
      </div>

      <div className="glass-card rounded-2xl p-6 mb-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Week Progress</p>
        <Progress value={q.data.weekPct} className="h-2" />
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Recently Completed</h2>
        <ul className="space-y-2">
          {q.data.recent.map((t) => (
            <li key={t.id} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald" />
              <span className="flex-1">{t.title}</span>
              <span className="text-[10px] text-muted-foreground">+{t.xp} XP</span>
            </li>
          ))}
          {q.data.recent.length === 0 && <li className="text-sm text-muted-foreground">No completed tasks yet.</li>}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}