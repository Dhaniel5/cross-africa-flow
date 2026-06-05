import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LogOut, Download, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — SOW Waitlist" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Signup = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  country: string;
  user_type: string;
  pain_point: string | null;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
};

function AdminPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Signup[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!cancelled) setEmail(userData.user?.email ?? null);

      const { data, error } = await supabase.rpc("admin_list_waitlist_signups");
      if (cancelled) return;
      if (error) {
        setError(
          error.message.includes("not_authorized")
            ? "Your account is not an admin. Ask the project owner to grant you the admin role."
            : error.message
        );
      } else {
        setRows((data ?? []) as Signup[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const filtered = (rows ?? []).filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q) ||
      r.user_type.toLowerCase().includes(q) ||
      (r.pain_point ?? "").toLowerCase().includes(q) ||
      r.referral_code.toLowerCase().includes(q)
    );
  });

  const exportCsv = () => {
    if (!rows?.length) return;
    const headers = [
      "created_at",
      "full_name",
      "phone",
      "email",
      "country",
      "user_type",
      "pain_point",
      "referral_code",
      "referred_by",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(","),
      ...filtered.map((r) =>
        headers.map((h) => escape((r as Record<string, unknown>)[h])).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sow-waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Waitlist submissions
            </h1>
            {email && <p className="text-xs text-muted-foreground">Signed in as {email}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!rows?.length}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading submissions…
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium">{error}</p>
              <p className="mt-1 text-muted-foreground">
                Run this SQL (in the backend) to grant yourself admin access, then refresh:
              </p>
              <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">
{`insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users
where email = '${email ?? "you@example.com"}'
on conflict do nothing;`}
              </pre>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <Input
                placeholder="Search name, email, phone, country…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="max-w-sm"
              />
              <p className="text-sm text-muted-foreground">
                {filtered.length} of {rows?.length ?? 0}
              </p>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Country</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Pain point</th>
                    <th className="px-3 py-2">Referral</th>
                    <th className="px-3 py-2">Referred by</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-border align-top">
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground">{r.full_name}</td>
                      <td className="px-3 py-2">{r.email}</td>
                      <td className="px-3 py-2">{r.phone}</td>
                      <td className="px-3 py-2">{r.country}</td>
                      <td className="px-3 py-2">{r.user_type}</td>
                      <td className="max-w-xs px-3 py-2 text-muted-foreground">{r.pain_point}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.referral_code}</td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {r.referred_by ?? "—"}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">
                        No submissions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
