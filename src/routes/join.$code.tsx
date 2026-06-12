import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setPendingInvite, storeSquadKey, readPendingKeyFor } from "@/lib/squadCrypto";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/join/$code")({
  ssr: false,
  component: JoinPage,
});

function JoinPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Joining your squad…");

  useEffect(() => {
    (async () => {
      // Extract key from URL fragment if present; persist into sessionStorage
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const key = params.get("k");
      if (key) setPendingInvite(code, key);

      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setPendingInvite(code, key ?? readPendingKeyFor(code));
        navigate({ to: "/auth" });
        return;
      }

      const { data, error } = await supabase.rpc("join_squad_by_code", { _code: code });
      if (error) {
        setStatus(error.message);
        toast.error(error.message);
        return;
      }
      const squad = Array.isArray(data) ? data[0] : data;
      if (!squad) {
        setStatus("Invalid invite code");
        return;
      }
      const localKey = key ?? readPendingKeyFor(code);
      if (localKey) storeSquadKey(squad.id, localKey);
      toast.success(`Joined ${squad.name}`);
      navigate({ to: "/chat" });
    })();
  }, [code, navigate]);

  return (
    <div className="min-h-screen grid place-items-center text-center px-4">
      <div>
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-emerald" />
        <p className="text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  );
}