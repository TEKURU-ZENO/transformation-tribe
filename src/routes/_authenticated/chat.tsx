import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/useAuthUser";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat")({
  component: Chat,
});

function timeLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function Chat() {
  const { user } = useAuthUser();
  const [text, setText] = useState("");
  const [activeSquad, setActiveSquad] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const squadsQ = useQuery({
    queryKey: ["chat-squads", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: links } = await supabase.from("squad_members").select("squad_id").eq("user_id", user!.id);
      const ids = links?.map((l) => l.squad_id) ?? [];
      if (!ids.length) return [];
      const { data } = await supabase.from("squads").select("*").in("id", ids);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!activeSquad && squadsQ.data?.length) setActiveSquad(squadsQ.data[0].id);
  }, [squadsQ.data, activeSquad]);

  const messagesQ = useQuery({
    queryKey: ["messages", activeSquad],
    enabled: !!activeSquad,
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, profiles(name)")
        .eq("squad_id", activeSquad!)
        .order("created_at");
      return data ?? [];
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQ.data]);

  useEffect(() => {
    if (!activeSquad) return;
    const ch = supabase
      .channel(`messages-${activeSquad}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `squad_id=eq.${activeSquad}` }, () => messagesQ.refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeSquad, messagesQ]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user || !activeSquad) return;
    await supabase.from("messages").insert({ squad_id: activeSquad, user_id: user.id, content: text.trim() });
    setText("");
  }

  if (squadsQ.data?.length === 0) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Join or create a squad to start chatting.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10 flex flex-col h-[calc(100vh-3rem)] md:h-screen">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Guild Chat</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Clock className="h-3 w-3" /> Messages disappear after 24 hours
          </p>
        </div>
        {squadsQ.data && squadsQ.data.length > 1 && (
          <select
            value={activeSquad ?? ""}
            onChange={(e) => setActiveSquad(e.target.value)}
            className="bg-surface border border-white/10 rounded-md px-3 py-1.5 text-sm"
          >
            {squadsQ.data.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-auto space-y-3 glass-card rounded-2xl p-4">
        {(messagesQ.data ?? []).map((m: any) => {
          const mine = m.user_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${mine ? "bg-emerald/15 border border-emerald/20" : "bg-white/[0.04] border border-white/[0.06]"}`}>
                {!mine && <p className="text-[10px] font-semibold text-emerald mb-0.5">{m.profiles?.name ?? "Someone"}</p>}
                <p className="text-sm">{m.content}</p>
                <p className="text-[9px] text-muted-foreground mt-1">{timeLeft(m.expires_at)} left</p>
              </div>
            </div>
          );
        })}
        {messagesQ.data?.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-12">Be the first to say something today.</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="mt-4 flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Say something…" />
        <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}