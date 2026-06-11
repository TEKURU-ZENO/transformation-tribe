import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";
import { todayISO, completeTask, uncompleteTask } from "@/lib/ascend";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/today")({
  component: Today,
});

function Today() {
  const { user } = useAuthUser();
  const [val, setVal] = useState("");
  const today = todayISO();

  const q = useQuery({
    queryKey: ["today", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("tasks").select("*").eq("user_id", user!.id).eq("date", today).order("created_at")).data ?? [],
  });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!val.trim() || !user) return;
    await supabase.from("tasks").insert({ user_id: user.id, title: val.trim(), date: today, xp: 10 });
    setVal("");
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
  const done = tasks.filter((t) => t.completed).length;

  return (
    <div className="max-w-2xl mx-auto p-6 lg:p-10">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Today</p>
      <h1 className="text-4xl font-bold mb-1">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h1>
      <p className="text-sm text-muted-foreground mb-8">{done} of {tasks.length} done</p>

      <form onSubmit={add} className="flex gap-2 mb-6">
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Add to today…" className="text-base" />
        <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </form>

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-white/[0.04] group">
            <Checkbox checked={t.completed} onCheckedChange={() => toggle(t)} className="h-5 w-5" />
            <span className={`flex-1 text-base ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
            <span className="text-xs font-mono text-emerald">+{t.xp}</span>
            <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 transition">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          </li>
        ))}
        {tasks.length === 0 && <li className="text-center text-muted-foreground py-12">Nothing yet. What's the plan?</li>}
      </ul>
    </div>
  );
}