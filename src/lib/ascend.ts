import { supabase } from "@/integrations/supabase/client";

export function xpForLevel(level: number) {
  return level * level * 50;
}
export function levelForXp(xp: number) {
  return Math.max(1, Math.floor(Math.sqrt(xp / 50)) + 1);
}

export async function completeTask(taskId: string, xp: number, title: string) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) throw new Error("Not signed in");

  const { error } = await supabase
    .from("tasks")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) throw error;

  const { data: profile } = await supabase.from("profiles").select("xp").eq("id", uid).single();
  const newXp = (profile?.xp ?? 0) + xp;
  const newLevel = levelForXp(newXp);
  await supabase.from("profiles").update({ xp: newXp, level: newLevel }).eq("id", uid);
  await supabase.from("activities").insert({ user_id: uid, emoji: "⚡", message: `completed ${title}` });
}

export async function uncompleteTask(taskId: string, xp: number) {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id;
  if (!uid) return;
  await supabase.from("tasks").update({ completed: false, completed_at: null }).eq("id", taskId);
  const { data: profile } = await supabase.from("profiles").select("xp").eq("id", uid).single();
  const newXp = Math.max(0, (profile?.xp ?? 0) - xp);
  await supabase.from("profiles").update({ xp: newXp, level: levelForXp(newXp) }).eq("id", uid);
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