import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";
import { weekDates, dateISO, completeTask, uncompleteTask } from "@/lib/ascend";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/planner")({
  component: Planner,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Planner() {
  const { user } = useAuthUser();
  const days = weekDates();
  const [dragId, setDragId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const startISO = dateISO(days[0]);
  const endISO = dateISO(days[6]);

  const q = useQuery({
    queryKey: ["planner", user?.id, startISO],
    enabled: !!user,
    queryFn: async () =>
      (await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user!.id)
        .gte("date", startISO)
        .lte("date", endISO)
        .order("created_at")).data ?? [],
  });

  async function addTo(date: string) {
    const title = drafts[date]?.trim();
    if (!title || !user) return;
    await supabase.from("tasks").insert({ user_id: user.id, title, date, xp: 10 });
    setDrafts((d) => ({ ...d, [date]: "" }));
    q.refetch();
  }

  async function moveTo(id: string, date: string) {
    await supabase.from("tasks").update({ date }).eq("id", id);
    q.refetch();
  }

  async function toggle(t: any) {
    if (t.completed) await uncompleteTask(t.id, t.xp);
    else await completeTask(t.id, t.xp, t.title);
    q.refetch();
  }

  async function remove(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    q.refetch();
  }

  const tasks = q.data ?? [];

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-3xl font-bold mb-2">Weekly Planner</h1>
      <p className="text-sm text-muted-foreground mb-8">Drag cards between days. Stay flexible.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((d, i) => {
          const iso = dateISO(d);
          const dayTasks = tasks.filter((t) => t.date === iso);
          const isToday = iso === dateISO(new Date());
          return (
            <div
              key={iso}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragId && moveTo(dragId, iso)}
              className={`rounded-xl border ${isToday ? "border-emerald/30 bg-emerald/[0.03]" : "border-white/[0.04] bg-surface/40"} p-3 min-h-[280px] flex flex-col`}
            >
              <div className="flex items-baseline justify-between mb-3">
                <p className={`text-xs font-bold uppercase tracking-widest ${isToday ? "text-emerald" : "text-muted-foreground"}`}>{DAYS[i]}</p>
                <p className="text-[10px] text-muted-foreground">{d.getDate()}</p>
              </div>
              <div className="space-y-2 flex-1">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                    className="group p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:border-emerald/20 cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox checked={t.completed} onCheckedChange={() => toggle(t)} className="mt-0.5" />
                      <span className={`flex-1 text-xs ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
                      <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); addTo(iso); }}
                className="mt-2 flex gap-1"
              >
                <Input
                  value={drafts[iso] ?? ""}
                  onChange={(e) => setDrafts((dr) => ({ ...dr, [iso]: e.target.value }))}
                  placeholder="+ add"
                  className="h-7 text-xs"
                />
                <button type="submit" className="h-7 w-7 grid place-items-center rounded-md bg-white/[0.04] hover:bg-emerald/10 hover:text-emerald">
                  <Plus className="h-3 w-3" />
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}