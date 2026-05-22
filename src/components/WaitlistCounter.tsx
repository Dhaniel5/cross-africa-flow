import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

const GOAL = 1000;

export function WaitlistCounter() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    supabase.rpc("get_waitlist_count").then(({ data }) => {
      if (cancelled) return;
      const base = 847; // seed for social proof
      setCount(base + (typeof data === "number" ? data : 0));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const pct = Math.min(100, Math.round((count / GOAL) * 100));

  return (
    <div className="mx-auto max-w-xl rounded-2xl border bg-card/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-foreground">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-semibold">{count.toLocaleString()}+</span>
          <span className="text-muted-foreground">people interested</span>
        </div>
        <span className="text-muted-foreground">Goal {GOAL.toLocaleString()}</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-brand)] transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
