import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trophy, Users, Plus, Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/squad")({
  component: SquadPage,
});

function SquadPage() {
  const { user } = useAuthUser();
  const [newName, setNewName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const squadsQ = useQuery({
    queryKey: ["squads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: links } = await supabase.from("squad_members").select("squad_id").eq("user_id", user!.id);
      const ids = links?.map((l) => l.squad_id) ?? [];
      if (!ids.length) return [];
      const { data: squads } = await supabase.from("squads").select("*").in("id", ids);
      return squads ?? [];
    },
  });

  const membersQ = useQuery({
    queryKey: ["squad-members", squadsQ.data?.map((s) => s.id).join()],
    enabled: !!squadsQ.data?.length,
    queryFn: async () => {
      const sids = squadsQ.data!.map((s) => s.id);
      const { data: members } = await supabase.from("squad_members").select("*").in("squad_id", sids);
      const uids = Array.from(new Set((members ?? []).map((m) => m.user_id)));
      const { data: profs } = await supabase.from("profiles").select("*").in("id", uids);
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      const startISO = start.toISOString().slice(0, 10);
      const { data: tasks } = await supabase.from("tasks").select("user_id,completed").in("user_id", uids).gte("date", startISO);
      const rows = (profs ?? []).map((p) => {
        const t = (tasks ?? []).filter((x) => x.user_id === p.id);
        const pct = t.length ? Math.round((t.filter((x) => x.completed).length / t.length) * 100) : 0;
        return { ...p, weekPct: pct };
      });
      return { members: members ?? [], profiles: rows };
    },
  });

  async function createSquad() {
    if (!newName.trim() || !user) return;
    const { data, error } = await supabase
      .from("squads")
      .insert({ name: newName.trim(), owner_id: user.id })
      .select()
      .single();
    if (error) return toast.error(error.message);
    await supabase.from("squad_members").insert({ squad_id: data!.id, user_id: user.id });
    setNewName("");
    toast.success(`Squad created. Invite code: ${data!.invite_code}`);
    squadsQ.refetch();
  }

  async function joinSquad() {
    if (!joinCode.trim() || !user) return;
    const { data: squad, error } = await supabase
      .from("squads")
      .select("id,name")
      .eq("invite_code", joinCode.trim().toUpperCase())
      .maybeSingle();
    if (error || !squad) return toast.error("Invalid invite code");
    const { error: joinErr } = await supabase.from("squad_members").insert({ squad_id: squad.id, user_id: user.id });
    if (joinErr) return toast.error(joinErr.message);
    setJoinCode("");
    toast.success(`Joined ${squad.name}`);
    squadsQ.refetch();
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      <div className="flex items-baseline justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Squad</h1>
          <p className="text-sm text-muted-foreground mt-1">Friends keep you honest.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New / Join</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create or join a squad</DialogTitle></DialogHeader>
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Create new</p>
                <div className="flex gap-2">
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Squad name" />
                  <Button onClick={createSquad}>Create</Button>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Join via invite code</p>
                <div className="flex gap-2">
                  <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="ABC123" className="uppercase" />
                  <Button onClick={joinSquad} variant="secondary">Join</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {squadsQ.data?.length === 0 && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">You're not in a squad yet. Create one or join with a friend's code.</p>
        </div>
      )}

      <div className="space-y-8">
        {squadsQ.data?.map((squad) => (
          <div key={squad.id} className="glass-card rounded-2xl p-6">
            <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
              <h2 className="text-xl font-bold">{squad.name}</h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(squad.invite_code);
                  toast.success("Invite code copied");
                }}
                className="text-xs font-mono px-3 py-1 rounded-full bg-emerald/10 text-emerald hover:bg-emerald/20 flex items-center gap-1.5"
              >
                <Copy className="h-3 w-3" /> {squad.invite_code}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {membersQ.data?.profiles
                .filter((p) => membersQ.data?.members.some((m) => m.squad_id === squad.id && m.user_id === p.id))
                .map((p) => (
                  <Link
                    key={p.id}
                    to="/profile/$userId"
                    params={{ userId: p.id }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-emerald/30 transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-10 w-10"><AvatarFallback>{p.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{p.name}</p>
                        <p className="text-[10px] text-emerald flex items-center gap-1">
                          <Trophy className="h-3 w-3" /> Lvl {p.level} · {p.xp} XP
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] mb-1 text-muted-foreground">
                      <span>This week</span><span className="font-mono">{p.weekPct}%</span>
                    </div>
                    <Progress value={p.weekPct} className="h-1.5" />
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}