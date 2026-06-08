import { useEffect, useState, type ReactNode } from "react";
import { Loader2, ShieldAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUB_URL = "https://pastebin.com/raw/3VRBKyiq";

type SubData = { sub: boolean; expiry_date: string };
type State =
  | { kind: "loading" }
  | { kind: "ok"; data: SubData }
  | { kind: "expired"; data: SubData }
  | { kind: "blocked"; data: SubData }
  | { kind: "error"; msg: string };

async function fetchSub(): Promise<SubData> {
  const res = await fetch(SUB_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const txt = await res.text();
  const json = JSON.parse(txt);
  return { sub: !!json.sub, expiry_date: String(json.expiry_date || "") };
}

export function SubscriptionGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  async function load() {
    setState({ kind: "loading" });
    try {
      const data = await fetchSub();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const exp = new Date(data.expiry_date);
      if (!data.sub) return setState({ kind: "blocked", data });
      if (isNaN(exp.getTime()) || exp < today) return setState({ kind: "expired", data });
      setState({ kind: "ok", data });
    } catch (e: any) {
      setState({ kind: "error", msg: e?.message ?? "Network error" });
    }
  }

  useEffect(() => { load(); }, []);

  if (state.kind === "loading") {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-center">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Verifying subscription…</p>
        </div>
      </div>
    );
  }

  if (state.kind === "ok") return <>{children}</>;

  const title = state.kind === "error" ? "Unable to verify subscription" : "Subscription Expired";
  const msg =
    state.kind === "error"
      ? state.msg
      : "Contact Prajwal to renew your SmartInvoice subscription.";

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-background to-destructive/10 p-4">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto size-14 rounded-full bg-destructive/10 grid place-items-center">
          <ShieldAlert className="size-7 text-destructive" />
        </div>
        <h1 className="mt-4 text-xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{msg}</p>
        {(state.kind === "expired" || state.kind === "blocked") && (
          <p className="mt-3 text-xs text-muted-foreground font-mono">
            Expiry: {state.data.expiry_date || "—"}
          </p>
        )}
        <Button onClick={load} className="mt-6" variant="outline">
          <RefreshCw className="size-4 mr-2" /> Retry
        </Button>
        <p className="mt-6 text-[11px] opacity-60">Developed by Prajwal</p>
      </div>
    </div>
  );
}
