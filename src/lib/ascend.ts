import { supabase } from "@/integrations/supabase/client";

export function xpForLevel(level: number) {
  return level * level * 50;
}
export function levelForXp(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export async function completeTask(taskId: string, xp: number, title: string) {
  void xp;
  void title;
  const { error } = await supabase.rpc("complete_task", { _task_id: taskId });
  if (error) throw error;
}

export async function uncompleteTask(taskId: string, xp: number) {
  void xp;
  const { error } = await supabase.rpc("uncomplete_task", { _task_id: taskId });
  if (error) throw error;
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function weekDates(start?: Date) {
  const d = start ?? new Date();
  const dow = d.getDay(); // 0=Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x;
  });
}

export function dateISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}