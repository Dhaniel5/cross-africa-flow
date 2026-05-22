import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Copy, Sparkles } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20)
    .regex(/^[+\d\s()-]+$/, "Only digits and + - ( ) allowed"),
  email: z.string().trim().email("Enter a valid email").max(255),
  country: z.enum(["Nigeria", "Ghana", "Other"]),
  user_type: z.enum(["Student", "Freelancer", "Business Owner", "POS Agent", "Other"]),
  pain_point: z.string().trim().max(500).optional(),
});

type SuccessState = { referralCode: string };

export function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    country: "" as "" | "Nigeria" | "Ghana" | "Other",
    user_type: "" as "" | "Student" | "Freelancer" | "Business Owner" | "POS Agent" | "Other",
    pain_point: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your inputs");
      return;
    }
    setLoading(true);
    try {
      const referredBy =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("ref")
          : null;

      const { data, error } = await supabase
        .from("waitlist_signups")
        .insert({
          full_name: parsed.data.full_name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          country: parsed.data.country,
          user_type: parsed.data.user_type,
          pain_point: parsed.data.pain_point || null,
          referred_by: referredBy,
        })
        .select("referral_code")
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already on the waitlist.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        return;
      }
      setSuccess({ referralCode: data.referral_code });
      toast.success("You're on the list!");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}/?ref=${success.referralCode}`
        : "";
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-elegant animate-fade-up">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-semibold">You're a Founding Member</h3>
        <p className="mt-2 text-muted-foreground">
          Check your inbox soon. Invite 3 friends to unlock priority early access.
        </p>
        <div className="mt-6 rounded-xl border bg-muted/40 p-4 text-left">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Your referral link
          </Label>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-background px-3 py-2 text-sm">
              {link}
            </code>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-[color:var(--accent-yellow)]" />
          Early features, priority access, and exclusive benefits await.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-card p-6 shadow-elegant sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            placeholder="Ada Lovelace"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (WhatsApp preferred)</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="+234 800 000 0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Country</Label>
            <Select
              value={form.country}
              onValueChange={(v) => setForm({ ...form, country: v as typeof form.country })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Ghana">Ghana</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>I am a…</Label>
            <Select
              value={form.user_type}
              onValueChange={(v) =>
                setForm({ ...form, user_type: v as typeof form.user_type })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Business Owner">Business Owner</SelectItem>
                <SelectItem value="POS Agent">POS Agent</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pain_point">
            What's your biggest problem with current banking apps?{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="pain_point"
            placeholder="Failed transfers, slow settlement, high FX fees…"
            rows={3}
            value={form.pain_point}
            onChange={(e) => setForm({ ...form, pain_point: e.target.value })}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full bg-[image:var(--gradient-brand)] text-base font-semibold shadow-glow hover:opacity-95"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining…
            </>
          ) : (
            "Join Early Access"
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          We'll only contact you about SOW early access. No spam.
        </p>
      </div>
    </form>
  );
}
